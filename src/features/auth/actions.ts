'use server'

import { randomUUID } from 'node:crypto'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { session, endSession } from './server/session'
import { hashPassword, verifyPassword } from './server/password'
import { findUserByEmail, insertUser } from './server/repository'
import { getTemplate } from '@/features/templates/registry'
import { createTrial } from '@/features/billing/server/repository'
import { clearLoginFailures, loginAllowed, recordLoginFailure } from './server/rate-limit'
import { clientAddress, consumeRateLimit } from '@/server/rate-limit'

export async function authenticate(_state: { error: string }, form: FormData): Promise<{ error: string }> {
  const email = String(form.get('email') || '').trim().toLowerCase()
  const password = String(form.get('password') || '')
  const name = String(form.get('name') || '').trim()
  const registering = form.get('mode') === 'register'
  const invalid = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    || email.length > 254 || password.length < 8 || password.length > 128
    || (registering && (!name || name.length > 80))

  if (invalid) return { error: 'Ingresá datos válidos y una contraseña de 8 a 128 caracteres.' }

  if (registering) {
    if (await findUserByEmail(email)) return { error: 'Ese email ya tiene una cuenta. Iniciá sesión.' }
    const id = randomUUID()
    try {
      await insertUser({ id, name, email }, hashPassword(password))
       await createTrial(id)
    } catch {
      return { error: 'No pudimos crear la cuenta. Intentá nuevamente.' }
    }
    await session(id)
  } else {
    const address = clientAddress(await headers())
    if (!await consumeRateLimit(`login:${address}`, 20, 15 * 60 * 1000)) return { error: 'Demasiados intentos. Probá nuevamente más tarde.' }
    if (!await loginAllowed(email)) return { error: 'Email o contraseña incorrectos.' }
    const user = await findUserByEmail(email)
    if (!user || !verifyPassword(password, user.password)) {
      await recordLoginFailure(email)
      return { error: 'Email o contraseña incorrectos.' }
    }
    await clearLoginFailures(email)
    await session(user.id)
  }
  const template = getTemplate(String(form.get('template') || ''))
  redirect(template ? `/dashboard/new?template=${template.id}` : '/dashboard')
}

export async function logout() {
  await endSession()
  redirect('/login')
}
