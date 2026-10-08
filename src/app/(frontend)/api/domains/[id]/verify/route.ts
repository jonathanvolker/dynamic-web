import { NextResponse } from 'next/server'
import { promises as dns } from 'node:dns'
import { currentUser } from '@/features/auth/server/session'
import { findDomain, markDomainVerified } from '@/features/domains/server/repository'
import { findSite } from '@/features/sites/server/repository'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  const domain = findDomain((await params).id)
  if (!domain) return NextResponse.json({ error: 'Dominio inexistente.' }, { status: 404 })
  const site = findSite(domain.site_id, user.id)
  if (!site) return NextResponse.json({ error: 'No autorizado.' }, { status: 403 })
  try {
    const cname = await dns.resolveCname(domain.hostname)
    const target = process.env.FORMA_CNAME_TARGET || 'forma.example.com'
    if (!cname.some(value => value.replace(/\.$/, '') === target.replace(/\.$/, ''))) return NextResponse.json({ error: 'El CNAME todavía no apunta a Forma.' }, { status: 422 })
    markDomainVerified(domain.id)
    return NextResponse.json({ verified: true })
  } catch {
    return NextResponse.json({ error: 'No pudimos resolver el CNAME todavía.' }, { status: 422 })
  }
}
