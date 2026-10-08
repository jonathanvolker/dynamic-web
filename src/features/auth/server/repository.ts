import 'server-only'
import { postgresQuery } from '@/server/db/postgres'
import type { User } from '../types'

type UserRow = User & { password: string }

export async function findUserByEmail(email: string) {
  const result = await postgresQuery<UserRow>(
    'SELECT id, name, email, role, password FROM platform_users WHERE email = $1',
    [email],
  )
  return result.rows[0]
}

export async function insertUser(user: User, password: string) {
  await postgresQuery(
    'INSERT INTO platform_users (id, name, email, password, role) VALUES ($1, $2, $3, $4, $5)',
    [user.id, user.name, user.email, password, user.role || 'user'],
  )
}
