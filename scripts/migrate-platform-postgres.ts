import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { postgresQuery, withPostgresTransaction } from '../src/server/db/postgres'
import { seedPlatformPlans } from '../src/features/billing/server/repository'

const currentFile = fileURLToPath(import.meta.url)
const root = path.resolve(path.dirname(currentFile), '..')
const schemaPath = path.join(root, 'src/server/db/postgres-schema.sql')
const schema = await readFile(schemaPath, 'utf8')

if (!process.env.DATABASE_URI) throw new Error('Definí DATABASE_URI antes de migrar la plataforma a PostgreSQL.')

await withPostgresTransaction(async client => {
  await client.query(schema)
  await client.query(`INSERT INTO platform_schema_migrations (version) VALUES (1) ON CONFLICT (version) DO NOTHING`)
})

await seedPlatformPlans()

const result = await postgresQuery<{ version: number }>('SELECT version FROM platform_schema_migrations ORDER BY version')
process.stdout.write(`Esquema PostgreSQL de plataforma aplicado. Versiones: ${result.rows.map(row => row.version).join(', ') || 'ninguna'}\n`)
