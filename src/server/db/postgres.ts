import 'server-only'
import { Pool, type PoolClient, type QueryResultRow } from 'pg'

const globalForPostgres = globalThis as typeof globalThis & { formaPostgresPool?: Pool }

export function postgresPool() {
  if (!process.env.DATABASE_URI) throw new Error('DATABASE_URI es obligatorio para la persistencia PostgreSQL.')
  if (!globalForPostgres.formaPostgresPool) {
    globalForPostgres.formaPostgresPool = new Pool({
      connectionString: process.env.DATABASE_URI,
      max: Number(process.env.DATABASE_POOL_MAX || 10),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    })
    globalForPostgres.formaPostgresPool.on('error', error => console.error('[postgres] pool error', error))
  }
  return globalForPostgres.formaPostgresPool
}

export async function withPostgresTransaction<T>(work: (client: PoolClient) => Promise<T>) {
  const client = await postgresPool().connect()
  try {
    await client.query('BEGIN')
    const result = await work(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function postgresQuery<T extends QueryResultRow = QueryResultRow>(text: string, values: unknown[] = []) {
  return postgresPool().query<T>(text, values)
}

export async function closePostgresPool() {
  if (globalForPostgres.formaPostgresPool) {
    await globalForPostgres.formaPostgresPool.end()
    globalForPostgres.formaPostgresPool = undefined
  }
}
