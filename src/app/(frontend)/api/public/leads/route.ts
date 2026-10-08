import { NextResponse } from 'next/server'
import { publicSite } from '@/features/sites/server/repository'
import { consumeLeadRateLimit, saveLead } from '@/features/sites/server/leads'
import { clientAddress } from '@/server/rate-limit'

const MAX_PAYLOAD_BYTES = 128 * 1024
const MAX_VALUE_LENGTH = 5000
const MAX_VALUE_KEYS = 20

async function readPayload(request: Request) {
  if (!request.body) return ''
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > MAX_PAYLOAD_BYTES) return null
    chunks.push(value)
  }
  const body = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }
  return new TextDecoder().decode(body)
}

export async function POST(request: Request) {
  try {
    const contentLength = request.headers.get('content-length')
    if (contentLength && (!/^\d+$/.test(contentLength) || Number(contentLength) > MAX_PAYLOAD_BYTES)) return NextResponse.json({ error: 'El formulario supera el límite permitido.' }, { status: 413 })
    const body = await readPayload(request)
    if (body === null) return NextResponse.json({ error: 'El formulario supera el límite permitido.' }, { status: 413 })
    const input = JSON.parse(body) as { siteSlug?: unknown; kind?: unknown; formId?: unknown; values?: unknown }
    const siteSlug = typeof input.siteSlug === 'string' ? input.siteSlug : ''
    const kind = input.kind === 'newsletter' ? 'newsletter' : input.kind === 'contact' ? 'contact' : null
    const formId = typeof input.formId === 'string' ? input.formId : ''
    const values = input.values && typeof input.values === 'object' && !Array.isArray(input.values) ? input.values as Record<string, unknown> : null
    const site = siteSlug ? publicSite(siteSlug) : null
    if (!site?.published || !kind || !formId || formId.length > 100 || !values || Object.keys(values).length > MAX_VALUE_KEYS || Object.entries(values).some(([key, value]) => key.length > 100 || typeof value !== 'string' || value.length > MAX_VALUE_LENGTH)) return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 })
    const section = site.published.sections.find(item => item.id === formId || item.anchor === formId)
    const expectedKind = section?.blockType === 'form' ? 'contact' : section?.blockType === 'newsletter' ? 'newsletter' : null
    if (!section || expectedKind !== kind) return NextResponse.json({ error: 'El formulario no está disponible.' }, { status: 400 })
    const forwarded = clientAddress(request.headers)
    const limit = kind === 'newsletter' ? 3 : 5
    if (!consumeLeadRateLimit(`${site.id}:${kind}:${forwarded}`, limit, 15 * 60 * 1000)) return NextResponse.json({ error: 'Demasiados intentos. Probá nuevamente más tarde.' }, { status: 429 })
    const normalized = values as Record<string, string>
    if (normalized.website) return NextResponse.json({ success: true })
    const allowedFields = kind === 'contact' ? (section.formFields || []) : [{ name: 'email', required: true, type: 'email' as const }, { name: 'consent', required: true, type: 'text' as const }]
    const allowedNames = new Set(allowedFields.map(field => field.name))
    const filtered = Object.fromEntries(Object.entries(normalized).filter(([key]) => key === 'website' || allowedNames.has(key)))
    if (Object.keys(filtered).length > MAX_VALUE_KEYS) return NextResponse.json({ error: 'Demasiados campos.' }, { status: 400 })
    for (const field of allowedFields) {
      const value = filtered[field.name]
      if (field.required && (!value || !String(value).trim())) return NextResponse.json({ error: 'Completá todos los campos requeridos.' }, { status: 400 })
      if (value && field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) return NextResponse.json({ error: 'Email inválido.' }, { status: 400 })
    }
    if (kind === 'newsletter' && filtered.consent !== 'on') return NextResponse.json({ error: 'Necesitás aceptar el consentimiento.' }, { status: 400 })
    saveLead(site.id, kind, formId, filtered)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'No pudimos procesar el formulario.' }, { status: 400 })
  }
}
