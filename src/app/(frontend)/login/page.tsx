import Link from 'next/link'
import { redirect } from 'next/navigation'
import { currentUser } from '@/features/auth/server/session'
import AuthForm from '@/features/auth/components/AuthForm'
import { getTemplate } from '@/features/templates/registry'

export default async function Login({ searchParams }: { searchParams: Promise<{ template?: string }> }) {
  const template = getTemplate((await searchParams).template || '')
  if (await currentUser()) redirect(template ? `/dashboard/new?template=${template.id}` : '/dashboard')
  return (
    <main className="platform auth-page">
      <Link className="p-logo" href="/">forma<span>✳</span></Link>
      <div className="auth-card">
        <span className="p-kicker">UN ESPACIO PARA TUS IDEAS</span><h1>Hola de nuevo.</h1>
        <p>{template ? `Entrá para crear tu web con ${template.name}.` : 'Tu próxima gran idea te está esperando.'}</p>
        <AuthForm register={false} template={template?.id} />
      </div>
    </main>
  )
}
