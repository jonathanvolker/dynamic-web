import { NextResponse } from 'next/server'
import { isVerifiedHostname } from '@/features/domains/server/repository'
import { normalizeHostname } from '@/features/domains/validation'

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get('domain') || ''
  const hostname = raw.match(/^(.*):\d+$/)?.[1] || raw
  const normalized = normalizeHostname(hostname)
  return normalized && await isVerifiedHostname(normalized) ? new NextResponse('ok') : new NextResponse('forbidden', { status: 403 })
}
