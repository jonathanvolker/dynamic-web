import { NextResponse } from 'next/server'
import { publicSite } from '@/features/sites/server/repository'
import { saveLead } from '@/features/sites/server/leads'

export async function POST(request: Request) {
  try {
    const input = await request.json() as { siteSlug?: unknown; kind?: unknown; formId?: unknown; values?: unknown }
    const siteSlug = typeof input.siteSlug === 'string' ? input.siteSlug : ''
    const kind = input.kind === 'newsletter' ? 'newsletter' : input.kind === 'contact' ? 'contact' : null
    const formId = typeof input.formId === 'string' ? input.formId : ''
    const values = input.values && typeof input.values === 'object' && !Array.isArray(input.values) ? input.values as Record<string, unknown> : null
    const site = siteSlug ? publicSite(siteSlug) : null
    if (!site?.published || !kind || !formId || formId.length > 100 || !values) return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 })
    const normalized = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, typeof value === 'string' ? value.slice(0, 5000) : '']))
    if (normalized.website) return NextResponse.json({ success: true })
    if (kind === 'newsletter' && (!normalized.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email))) return NextResponse.json({ error: 'Email inválido.' }, { status: 400 })
    if (kind === 'contact' && (!normalized.email || !normalized.message)) return NextResponse.json({ error: 'Completá email y mensaje.' }, { status: 400 })
    if (Object.keys(normalized).length > 20) return NextResponse.json({ error: 'Demasiados campos.' }, { status: 400 })
    saveLead(site.id, kind, formId, normalized)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'No pudimos procesar el formulario.' }, { status: 400 })
  }
}
