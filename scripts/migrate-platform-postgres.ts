import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Pool } from 'pg'
import { planCatalog } from '../src/features/billing/plans'

const currentFile = fileURLToPath(import.meta.url)
const root = path.resolve(path.dirname(currentFile), '..')
const schemaPath = path.join(root, 'src/server/db/postgres-schema.sql')
const schema = await readFile(schemaPath, 'utf8')

if (!process.env.DATABASE_URI) throw new Error('Definí DATABASE_URI antes de migrar la plataforma a PostgreSQL.')

const pool = new Pool({ connectionString: process.env.DATABASE_URI, max: Number(process.env.DATABASE_POOL_MAX || 10) })
const client = await pool.connect()

try {
  await client.query('BEGIN')
  await client.query(schema)
  await client.query(`INSERT INTO platform_schema_migrations (version) VALUES (1) ON CONFLICT (version) DO NOTHING`)

  for (const plan of Object.values(planCatalog)) {
    await client.query(`INSERT INTO platform_plans (id, name, description, features, price, currency, max_sites, media_storage_bytes, max_media_per_site, allowed_blocks, custom_domain)
      VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9, $10::jsonb, $11)
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, features = EXCLUDED.features,
        price = EXCLUDED.price, max_sites = EXCLUDED.max_sites, media_storage_bytes = EXCLUDED.media_storage_bytes,
        max_media_per_site = EXCLUDED.max_media_per_site, allowed_blocks = EXCLUDED.allowed_blocks, custom_domain = EXCLUDED.custom_domain`,
      [plan.id, plan.name, plan.description, JSON.stringify(plan.features), plan.price, plan.currency, plan.maxSites, plan.mediaStorageBytes,
        plan.maxMediaPerSite, JSON.stringify(plan.allowedBlocks), plan.customDomain])
  }

  await client.query('COMMIT')
  const result = await client.query<{ version: number }>('SELECT version FROM platform_schema_migrations ORDER BY version')
  process.stdout.write(`Esquema PostgreSQL de plataforma aplicado. Versiones: ${result.rows.map(row => row.version).join(', ') || 'ninguna'}\n`)
} catch (error) {
  await client.query('ROLLBACK').catch(() => undefined)
  throw error
} finally {
  client.release()
  await pool.end()
}
