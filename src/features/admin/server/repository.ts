import 'server-only'
import { db } from '@/server/db/sqlite'

export function platformAdminEmails() {
  return new Set(`${process.env.PLATFORM_ADMIN_EMAILS || ''},${process.env.PLATFORM_ADMIN_EMAIL || ''}`.split(',').map(email => email.trim().toLowerCase()).filter(Boolean))
}

export function isPlatformAdmin(email: string) {
  return platformAdminEmails().has(email.toLowerCase())
}

export function adminStats() {
  const database = db()
  return {
    users: (database.prepare('SELECT COUNT(*) AS count FROM users').get() as { count: number }).count,
    sites: (database.prepare('SELECT COUNT(*) AS count FROM sites').get() as { count: number }).count,
    published: (database.prepare('SELECT COUNT(*) AS count FROM sites WHERE published IS NOT NULL').get() as { count: number }).count,
    subscriptions: (database.prepare("SELECT COUNT(*) AS count FROM subscriptions WHERE status IN ('trialing', 'active', 'past_due')").get() as { count: number }).count,
    plans: database.prepare(`SELECT plans.id, plans.name, plans.price, plans.currency, COUNT(subscriptions.id) AS subscribers
      FROM plans LEFT JOIN subscriptions ON subscriptions.plan_id = plans.id GROUP BY plans.id ORDER BY plans.price`).all() as { id: string; name: string; price: number; currency: string; subscribers: number }[],
    usersList: database.prepare(`SELECT users.id, users.name, users.email,
      COALESCE(subscriptions.plan_id, 'none') AS plan_id, COALESCE(subscriptions.status, 'none') AS subscription_status,
      subscriptions.current_period_ends_at, COUNT(sites.id) AS site_count,
      SUM(CASE WHEN sites.published IS NOT NULL THEN 1 ELSE 0 END) AS published_count
      FROM users LEFT JOIN subscriptions ON subscriptions.user_id = users.id
      LEFT JOIN sites ON sites.owner_id = users.id GROUP BY users.id ORDER BY users.name COLLATE NOCASE`).all() as {
      id: string; name: string; email: string; plan_id: string; subscription_status: string;
      current_period_ends_at: string | null; site_count: number; published_count: number
    }[],
  }
}
