import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createHash, randomBytes } from 'node:crypto'
import { postgresQuery } from '@/server/db/postgres'
import type { User } from '../types'

const digest = (token: string) => createHash('sha256').update(token).digest('hex')

export async function session(user: string) {
  const token = randomBytes(32).toString('hex')
  await postgresQuery('DELETE FROM platform_sessions WHERE expires_at < NOW()')
  await postgresQuery(
    'INSERT INTO platform_sessions (token, user_id, expires_at) VALUES ($1, $2, $3)',
    [digest(token), user, new Date(Date.now() + 604800000)],
  )
  const jar = await cookies()
  jar.set('forma_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true',
    path: '/',
    maxAge: 604800,
  })
}

export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get('forma_session')?.value
  if (!token) return null
  const result = await postgresQuery<User>(`
    SELECT platform_users.id, platform_users.name, platform_users.email, platform_users.role
    FROM platform_users
    JOIN platform_sessions ON platform_sessions.user_id = platform_users.id
    WHERE platform_sessions.token = $1 AND platform_sessions.expires_at > NOW()
  `, [digest(token)])
  return result.rows[0] || null
}
export async function requireUser() {
  const user = await currentUser()
  if (!user) redirect('/login')
  return user
}

export async function requireAdmin() {
  const user = await requireUser()
  const configured = (process.env.PLATFORM_ADMIN_EMAILS || '').split(',').map(email => email.trim().toLowerCase()).filter(Boolean)
  if (user.role !== 'admin' && !configured.includes(user.email.toLowerCase())) redirect('/dashboard')
  return user
}

export async function endSession() {
  const jar = await cookies()
  const token = jar.get('forma_session')?.value
  if (token) await postgresQuery('DELETE FROM platform_sessions WHERE token = $1', [digest(token)])
  jar.delete('forma_session')
}
