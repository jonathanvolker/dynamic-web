'use client'
import { useEffect, useState } from 'react'
import SiteView from '@/features/website/components/SiteView'
import type { SiteDocument } from '@/features/sites/types'
export default function LivePreview() {
  const [document, setDocument] = useState<SiteDocument | null>(null)
  const [highlight, setHighlight] = useState<{ index: number | 'settings'; field: string | null }>({ index: 'settings', field: null })
  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== window.parent) return
      if (event.data?.type === 'forma:preview') setDocument(event.data.document)
      if (event.data?.type === 'forma:highlight') setHighlight({ index: event.data.index, field: event.data.field || null })
    }
    window.addEventListener('message', listener)
    window.parent.postMessage({ type: 'forma:ready' }, window.location.origin)
    return () => window.removeEventListener('message', listener)
  }, [])
  if (!document) return <p style={{ padding: 30 }}>Preparando vista previa…</p>
  return <div className="live-preview-root" onClick={(event) => {
    const element = event.target as HTMLElement
    if (element.closest('a')) event.preventDefault()
    const section = element.closest('main > section')
    if (section) window.parent.postMessage({ type: 'forma:select', index: Array.from(event.currentTarget.querySelectorAll('main > section')).indexOf(section) }, window.location.origin)
   }}><SiteView {...document} preview /><style>{`.live-preview-root [data-forma-highlight="true"] { outline: 3px solid #d6f76b; outline-offset: 7px; border-radius: 4px; box-shadow: 0 0 0 6px #eaff7566; } .live-preview-root .editor-invalid-link { background: #d9ddd4 !important; color: #65705f !important; border: 2px dashed #89947e !important; cursor: not-allowed; }`}</style><HighlightTarget index={highlight.index} field={highlight.field} /></div>
}

function HighlightTarget({ index, field }: { index: number | 'settings'; field: string | null }) {
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll('main > section'))
    sections.forEach(section => section.querySelectorAll('[data-forma-highlight="true"]').forEach(element => element.removeAttribute('data-forma-highlight')))
    if (typeof index !== 'number' || !field) return
    const target = sections[index]?.querySelector(`[data-forma-field="${field}"]`)
    target?.setAttribute('data-forma-highlight', 'true')
  }, [index, field])
  return null
}
