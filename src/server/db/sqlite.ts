import 'server-only'
import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import path from 'node:path'

let database: DatabaseSync | undefined

/** Shared local connection. Repositories own queries; routes never access SQL. */
export function db() {
  if (database) return database

  const directory = process.env.PLATFORM_DATA_DIR || path.join(process.cwd(), 'data')
  mkdirSync(directory, { recursive: true })
  database = new DatabaseSync(path.join(directory, 'platform.sqlite'))
  database.exec(`
    PRAGMA journal_mode=WAL;
    PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL
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
  `)
  return database
}
