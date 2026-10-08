import 'server-only'
import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { planCatalog } from '@/features/billing/plans'

let database: DatabaseSync | undefined

export function dataDirectory() {
  return process.env.PLATFORM_DATA_DIR || path.join(process.cwd(), 'data')
}

/** Shared local connection. Repositories own queries; routes never access SQL. */
export function db() {
  if (database) return database

  const directory = dataDirectory()
  mkdirSync(directory, { recursive: true })
  database = new DatabaseSync(path.join(directory, 'platform.sqlite'))
  database.exec(`
    PRAGMA journal_mode=WAL;
    PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'user'
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), expires INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sites (
      id TEXT PRIMARY KEY, owner_id TEXT NOT NULL REFERENCES users(id), name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL, draft TEXT NOT NULL, published TEXT,
      updated_at TEXT NOT NULL, published_at TEXT
    );
    CREATE INDEX IF NOT EXISTS sites_owner ON sites(owner_id);
    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY, owner_id TEXT NOT NULL REFERENCES users(id), created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS media_owner ON media(owner_id);
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY, site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
      kind TEXT NOT NULL, form_id TEXT NOT NULL, values_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS leads_site ON leads(site_id, created_at);
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS lead_notifications (
      id TEXT PRIMARY KEY, lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, read_at TEXT
    );
    CREATE INDEX IF NOT EXISTS lead_notifications_owner ON lead_notifications(owner_id, read_at);
    CREATE TABLE IF NOT EXISTS lead_rate_limits (
      bucket TEXT PRIMARY KEY, window_start INTEGER NOT NULL, count INTEGER NOT NULL
    );
  `)
  migrateBilling()
  return database
}

function migrateBilling() {
  if (!database) return
  const hasColumn = (table: string, column: string) => (database!.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]).some(item => item.name === column)
  const addColumn = (table: string, column: string, definition: string) => {
    if (!hasColumn(table, column)) database!.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
  }
  addColumn('users', 'role', "TEXT NOT NULL DEFAULT 'user'")
  const applied = database.prepare('SELECT version FROM schema_migrations').all() as { version: number }[]
  const versions = new Set(applied.map(item => item.version))
  if (!versions.has(1)) {
    database.exec(`
      CREATE TABLE IF NOT EXISTS plans (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL, features_json TEXT NOT NULL,
        price INTEGER NOT NULL, currency TEXT NOT NULL, max_sites INTEGER NOT NULL,
        allowed_blocks_json TEXT NOT NULL, custom_domain INTEGER NOT NULL, active INTEGER NOT NULL DEFAULT 1
      );
      CREATE TABLE IF NOT EXISTS subscriptions (
        id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan_id TEXT NOT NULL REFERENCES plans(id), status TEXT NOT NULL,
        starts_at TEXT NOT NULL, current_period_ends_at TEXT NOT NULL, grace_period_ends_at TEXT,
        provider TEXT NOT NULL, currency TEXT NOT NULL, contracted_price INTEGER NOT NULL,
        external_customer_id TEXT, external_subscription_id TEXT, cancel_at_period_end INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL, updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS subscriptions_user ON subscriptions(user_id, updated_at);
      CREATE TABLE IF NOT EXISTS billing_events (
        id TEXT PRIMARY KEY, provider TEXT NOT NULL, payload TEXT NOT NULL, created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS domains (
        id TEXT PRIMARY KEY, site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
        hostname TEXT UNIQUE NOT NULL, verification_token TEXT NOT NULL, status TEXT NOT NULL,
        verified_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS domains_site ON domains(site_id);
    `)
    database.prepare('INSERT INTO schema_migrations (version, applied_at) VALUES (1, ?)').run(new Date().toISOString())
  }
  // Older billing prototypes used a smaller schema. Extend it in place so existing users and subscriptions survive.
  addColumn('plans', 'description', "TEXT NOT NULL DEFAULT ''")
  addColumn('plans', 'features_json', "TEXT NOT NULL DEFAULT '[]'")
  addColumn('plans', 'price', 'INTEGER NOT NULL DEFAULT 0')
  addColumn('plans', 'max_sites', 'INTEGER NOT NULL DEFAULT 1')
  addColumn('plans', 'allowed_blocks_json', "TEXT NOT NULL DEFAULT '[]'")
  addColumn('plans', 'active', 'INTEGER NOT NULL DEFAULT 1')
  addColumn('subscriptions', 'starts_at', "TEXT NOT NULL DEFAULT ''")
  addColumn('subscriptions', 'current_period_ends_at', "TEXT NOT NULL DEFAULT ''")
  addColumn('subscriptions', 'grace_period_ends_at', 'TEXT')
  addColumn('subscriptions', 'currency', "TEXT NOT NULL DEFAULT 'ARS'")
  addColumn('subscriptions', 'contracted_price', 'INTEGER NOT NULL DEFAULT 0')
  addColumn('subscriptions', 'external_customer_id', 'TEXT')
  addColumn('subscriptions', 'external_subscription_id', 'TEXT')
  addColumn('subscriptions', 'cancel_at_period_end', 'INTEGER NOT NULL DEFAULT 0')
  if (hasColumn('plans', 'price_cents')) database.exec(`UPDATE plans SET price = price_cents WHERE price = 0 AND price_cents IS NOT NULL`)
  if (hasColumn('plans', 'site_limit')) database.exec(`UPDATE plans SET max_sites = site_limit WHERE max_sites = 1 AND site_limit IS NOT NULL`)
  database.exec(`UPDATE subscriptions SET starts_at = created_at WHERE starts_at = ''`)
  if (hasColumn('subscriptions', 'current_period_end')) database.exec(`UPDATE subscriptions SET current_period_ends_at = current_period_end WHERE current_period_ends_at = '' AND current_period_end IS NOT NULL`)
  database.exec(`UPDATE subscriptions SET contracted_price = COALESCE((SELECT price FROM plans WHERE plans.id = subscriptions.plan_id), 0) WHERE contracted_price = 0`)
  // Rename the prototype plan identifiers without breaking the foreign key.
  const starterExists = database.prepare("SELECT 1 FROM plans WHERE id = 'starter'").get()
  if (starterExists && !database.prepare("SELECT 1 FROM plans WHERE id = 'initial'").get()) {
    database.prepare("INSERT INTO plans (id, name, price_cents, currency, interval, site_limit, storage_limit_mb, custom_domain, description, features_json, price, max_sites, allowed_blocks_json, active) SELECT 'initial', name, price_cents, currency, interval, site_limit, storage_limit_mb, custom_domain, description, features_json, price, max_sites, allowed_blocks_json, active FROM plans WHERE id = 'starter'").run()
    database.prepare("UPDATE subscriptions SET plan_id = 'initial' WHERE plan_id = 'starter'").run()
    database.prepare("DELETE FROM plans WHERE id = 'starter'").run()
  }
  const proExists = database.prepare("SELECT 1 FROM plans WHERE id = 'pro'").get()
  if (proExists && !database.prepare("SELECT 1 FROM plans WHERE id = 'professional'").get()) {
    database.prepare("INSERT INTO plans (id, name, price_cents, currency, interval, site_limit, storage_limit_mb, custom_domain, description, features_json, price, max_sites, allowed_blocks_json, active) SELECT 'professional', name, price_cents, currency, interval, site_limit, storage_limit_mb, custom_domain, description, features_json, price, max_sites, allowed_blocks_json, active FROM plans WHERE id = 'pro'").run()
    database.prepare("UPDATE subscriptions SET plan_id = 'professional' WHERE plan_id = 'pro'").run()
    database.prepare("DELETE FROM plans WHERE id = 'pro'").run()
  }
  if (hasColumn('plans', 'site_limit')) {
    for (const plan of Object.values(planCatalog)) {
      database.prepare(`INSERT OR IGNORE INTO plans
        (id, name, price_cents, currency, interval, site_limit, storage_limit_mb, custom_domain)
        VALUES (?, ?, ?, 'ARS', 'month', ?, 0, ?)`).run(plan.id, plan.name, plan.price, plan.maxSites, plan.customDomain ? 1 : 0)
    }
  }
  for (const plan of Object.values(planCatalog)) {
    if (hasColumn('plans', 'site_limit')) {
      database.prepare(`UPDATE plans SET name = ?, description = ?, features_json = ?, price = ?, currency = ?,
        max_sites = ?, allowed_blocks_json = ?, custom_domain = ?, active = 1 WHERE id = ?`).run(
        plan.name, plan.description, JSON.stringify(plan.features), plan.price, plan.currency,
        plan.maxSites, JSON.stringify(plan.allowedBlocks), plan.customDomain ? 1 : 0, plan.id,
      )
    } else {
      database.prepare(`INSERT INTO plans
        (id, name, description, features_json, price, currency, max_sites, allowed_blocks_json, custom_domain, active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        ON CONFLICT(id) DO UPDATE SET name = excluded.name, description = excluded.description,
          features_json = excluded.features_json, price = excluded.price, currency = excluded.currency,
          max_sites = excluded.max_sites, allowed_blocks_json = excluded.allowed_blocks_json,
          custom_domain = excluded.custom_domain, active = 1`).run(
        plan.id, plan.name, plan.description, JSON.stringify(plan.features), plan.price, plan.currency,
        plan.maxSites, JSON.stringify(plan.allowedBlocks), plan.customDomain ? 1 : 0,
      )
    }
  }
}
