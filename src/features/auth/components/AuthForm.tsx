'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { authenticate } from '../actions'
import type { TemplateId } from '@/features/templates/types'

export default function AuthForm({ register, template }: { register: boolean; template?: TemplateId }) {
  const [state, action, pending] = useActionState(authenticate, { error: '' })

  return (
    <form action={action} className="p-form">
      <input type="hidden" name="mode" value={register ? 'register' : 'login'} />
      {template && <input type="hidden" name="template" value={template} />}
      {register && <label>Tu nombre<input name="name" autoComplete="name" required maxLength={80} placeholder="¿Cómo te llamás?" /></label>}
      <label>Email<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="vos@ejemplo.com" /></label>
      <label>Contraseña<input name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} required minLength={8} maxLength={128} placeholder="Al menos 8 caracteres" /></label>
      {state.error && <p className="p-error" role="alert">{state.error}</p>}
      <button className="p-button primary" disabled={pending}>
        {pending ? 'Un momento…' : register ? 'Crear mi cuenta ↗' : 'Entrar a mis sitios ↗'}
      </button>
      <p className="auth-switch">
        {register ? '¿Ya tenés cuenta?' : '¿Primera vez por acá?'}{' '}
        <Link href={`${register ? '/login' : '/register'}${template ? `?template=${template}` : ''}`}>{register ? 'Iniciá sesión' : 'Creá tu cuenta'}</Link>
      </p>
    </form>
  )
}
