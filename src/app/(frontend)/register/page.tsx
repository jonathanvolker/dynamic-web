import Link from 'next/link'
import { redirect } from 'next/navigation'
import { currentUser } from '@/features/auth/server/session'
import AuthForm from '@/features/auth/components/AuthForm'
import { getTemplate } from '@/features/templates/registry'

export default async function Register({ searchParams }: { searchParams: Promise<{ template?: string }> }) {
  const template = getTemplate((await searchParams).template || '')
  if (await currentUser()) redirect(template ? `/dashboard/new?template=${template.id}` : '/dashboard')
  return (
    <main className="platform auth-page">
      <Link className="p-logo" href="/">forma<span>✳</span></Link>
      <div className="auth-card">
        <span className="p-kicker">EMPEZÁ ALGO TUYO</span><h1>Hagámosle lugar.</h1>
        <p>{template ? `Elegiste ${template.name}. Creá tu cuenta para personalizarla.` : 'Creá tu cuenta y empezá a construir tu web.'}</p>
        <AuthForm register template={template?.id} />
      </div>
    </main>
  )
}
