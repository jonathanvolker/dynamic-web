'use client'
import { useEffect, useState } from 'react'
import SiteView from '@/features/website/components/SiteView'
import type { SiteDocument } from '@/features/sites/types'
export default function LivePreview() {
  const [document, setDocument] = useState<SiteDocument | null>(null)
  useEffect(() => {
    const listener = (event: MessageEvent) => { if (event.origin === window.location.origin && event.source === window.parent && event.data?.type === 'forma:preview') setDocument(event.data.document) }
    window.addEventListener('message', listener)
    window.parent.postMessage({ type: 'forma:ready' }, window.location.origin)
    return () => window.removeEventListener('message', listener)
  }, [])
  if (!document) return <p style={{ padding: 30 }}>Preparando vista previa…</p>
  return <div onClick={(event) => {
    const element = event.target as HTMLElement
    if (element.closest('a')) event.preventDefault()
    const section = element.closest('main > section')
    if (section) window.parent.postMessage({ type: 'forma:select', index: Array.from(event.currentTarget.querySelectorAll('main > section')).indexOf(section) }, window.location.origin)
  }}><SiteView {...document} /></div>
}
