import { NextResponse } from 'next/server'
import { promises as dns } from 'node:dns'
import { currentUser } from '@/features/auth/server/session'
import { assertCanUseCustomDomain } from '@/features/billing/server/access'
import { findDomain, markDomainVerified } from '@/features/domains/server/repository'
import { findSite } from '@/features/sites/server/repository'
import { normalizeDnsName, normalizeHostname } from '@/features/domains/validation'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  const domain = await findDomain((await params).id)
  if (!domain) return NextResponse.json({ error: 'Dominio inexistente.' }, { status: 404 })
  const site = await findSite(domain.site_id, user.id)
  if (!site) return NextResponse.json({ error: 'No autorizado.' }, { status: 403 })
  try {
    await assertCanUseCustomDomain(user.id)
  } catch {
    return NextResponse.json({ error: 'El dominio personalizado requiere una suscripción Profesional vigente.' }, { status: 403 })
  }
  if (!normalizeHostname(domain.hostname)) return NextResponse.json({ error: 'El hostname guardado no es válido.' }, { status: 422 })
  if (domain.status !== 'pending' && domain.status !== 'verified') return NextResponse.json({ error: 'El dominio no se puede verificar desde su estado actual.' }, { status: 409 })
  if (domain.status === 'verified') return NextResponse.json({ verified: true })
  try {
    const cname = await dns.resolveCname(domain.hostname)
    const target = normalizeDnsName(process.env.FORMA_CNAME_TARGET || '')
    if (!target || !cname.some(value => normalizeDnsName(value) === target)) return NextResponse.json({ error: 'El CNAME todavía no apunta a Forma.' }, { status: 422 })
    if (!await markDomainVerified(domain.id)) return NextResponse.json({ error: 'El dominio cambió de estado y debe verificarse nuevamente.' }, { status: 409 })
    return NextResponse.json({ verified: true })
  } catch {
    return NextResponse.json({ error: 'No pudimos resolver el CNAME todavía.' }, { status: 422 })
  }
}
