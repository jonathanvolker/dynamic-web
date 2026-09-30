import Link from 'next/link'
import { requireUser } from '@/features/auth/server/session'
import NewSiteForm from '@/features/sites/components/NewSiteForm'
import { getTemplate } from '@/features/templates/registry'

export default async function NewSite({ searchParams }: { searchParams: Promise<{ template?: string }> }) {
  await requireUser()
  const selected = getTemplate((await searchParams).template || 'studio')
  return (
    <main className="platform new-site-page">
      <Link href="/dashboard" className="text-link">← Mis sitios</Link>
      <span className="p-kicker">DE IDEA A SITIO</span>
      <h1>Algo nuevo empieza.</h1>
      <p>Un nombre, una base y todo lo que quieras construir.</p>
      <NewSiteForm key={selected?.id} selectedTemplate={selected?.id} />
    </main>
  )
}
