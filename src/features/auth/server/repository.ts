import 'server-only'
import { db } from '@/server/db/sqlite'
import type { User } from '../types'

export function findUserByEmail(email: string) {
  return db().prepare('SELECT * FROM users WHERE email = ?').get(email) as (User & { password: string }) | undefined
}

export function insertUser(user: User, password: string) {
  db().prepare('INSERT INTO users VALUES (?, ?, ?, ?)').run(user.id, user.name, user.email, password)
}
