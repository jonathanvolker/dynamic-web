import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createHash, randomBytes } from 'node:crypto'
import { db } from '@/server/db/sqlite'
import type { User } from '../types'

const digest = (token: string) => createHash('sha256').update(token).digest('hex')

export async function session(user: string) {
  const token = randomBytes(32).toString('hex')
  db().prepare('DELETE FROM sessions WHERE expires < ?').run(Date.now())
  db().prepare('INSERT INTO sessions VALUES (?, ?, ?)').run(digest(token), user, Date.now() + 604800000)
  const jar = await cookies()
  jar.set('forma_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.COOKIE_SECURE === 'true',
    path: '/',
    maxAge: 604800,
  })
}

export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get('forma_session')?.value
  if (!token) return null
  const user = db().prepare(`
    SELECT users.id, users.name, users.email, users.role FROM users
    JOIN sessions ON sessions.user_id = users.id
    WHERE sessions.token = ? AND sessions.expires > ?
  `).get(digest(token), Date.now())
  return user ? user as unknown as User : null
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
  if (token) db().prepare('DELETE FROM sessions WHERE token = ?').run(digest(token))
  jar.delete('forma_session')
}
