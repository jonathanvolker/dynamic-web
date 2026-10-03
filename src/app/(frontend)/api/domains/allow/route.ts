import { NextResponse } from 'next/server'
import { isVerifiedHostname } from '@/features/domains/server/repository'

export async function GET(request: Request) {
  const hostname = new URL(request.url).searchParams.get('domain')?.split(':')[0] || ''
  return isVerifiedHostname(hostname) ? new NextResponse('ok') : new NextResponse('forbidden', { status: 403 })
}
