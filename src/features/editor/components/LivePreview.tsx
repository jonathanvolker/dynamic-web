'use client'
import { useEffect, useState } from 'react'
import SiteView from '@/features/website/components/SiteView'
import type { SiteDocument } from '@/features/sites/types'
export default function LivePreview() {
  const [document, setDocument] = useState<SiteDocument | null>(null)
  const [highlight, setHighlight] = useState<{ index: number | 'settings' | 'footer'; field: string | null }>({ index: 'settings', field: null })
  const [scrollRequest, setScrollRequest] = useState(0)
  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== window.parent) return
      if (event.data?.type === 'forma:preview') setDocument(event.data.document)
      if (event.data?.type === 'forma:highlight') setHighlight({ index: event.data.index, field: event.data.field || null })
      if (event.data?.type === 'forma:scroll-to') {
        setHighlight({ index: event.data.index, field: event.data.field || null })
        setScrollRequest(request => request + 1)
      }
    }
    window.addEventListener('message', listener)
    window.parent.postMessage({ type: 'forma:ready' }, window.location.origin)
    return () => window.removeEventListener('message', listener)
  }, [])
  if (!document) return <p style={{ padding: 30 }}>Preparando vista previa…</p>
  return <div className="live-preview-root" onClick={(event) => {
    const element = event.target as HTMLElement
    if (element.closest('a')) event.preventDefault()
    const section = element.closest('main > section, footer')
    if (section) window.parent.postMessage({ type: 'forma:select', index: Array.from(event.currentTarget.querySelectorAll('main > section, footer')).indexOf(section) }, window.location.origin)
    else if (element.closest('footer')) window.parent.postMessage({ type: 'forma:select', index: 'footer' }, window.location.origin)
    }}><SiteView {...document} preview /><style>{`.live-preview-root [data-forma-highlight="true"] { outline: 3px solid #d6f76b; outline-offset: 7px; border-radius: 4px; box-shadow: 0 0 0 6px #eaff7566; } .live-preview-root .gallery-grid { scroll-snap-type: none; scroll-behavior: auto; } .live-preview-root .editor-invalid-link { background: #d9ddd4 !important; color: #65705f !important; border: 2px dashed #89947e !important; cursor: not-allowed; }`}</style><HighlightTarget index={highlight.index} field={highlight.field} scrollRequest={scrollRequest} /></div>
}

function HighlightTarget({ index, field, scrollRequest }: { index: number | 'settings' | 'footer'; field: string | null; scrollRequest: number }) {
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll('main > section, footer'))
    sections.forEach(section => section.querySelectorAll('[data-forma-highlight="true"]').forEach(element => element.removeAttribute('data-forma-highlight')))
    document.querySelectorAll('footer[data-forma-highlight="true"]').forEach(element => element.removeAttribute('data-forma-highlight'))
    if (index === 'footer') {
      const footer = document.querySelector('footer')
      footer?.setAttribute('data-forma-highlight', 'true')
      if (scrollRequest > 0) footer?.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'nearest' })
      return
    }
    if (index === 'settings') {
      const target = field ? document.querySelector(`[data-forma-field="${CSS.escape(field)}"]`) || document.querySelector(`[data-forma-field="${CSS.escape(field.split('.').slice(0, -1).join('.'))}"]`) : null
      if (target) {
        target.setAttribute('data-forma-highlight', 'true')
        if (scrollRequest > 0) target.closest('header, main > section, footer')?.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'nearest' })
      }
      return
    }
    if (typeof index !== 'number') return
    const section = sections[index]
    if (!section) return
    const target = field ? section.querySelector(`[data-forma-field="${CSS.escape(field)}"]`) || section.querySelector(`[data-forma-field="${CSS.escape(field.split('.').slice(0, -1).join('.'))}"]`) : null
    ;(target || section).setAttribute('data-forma-highlight', 'true')
    if (scrollRequest > 0) section.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'nearest' })
  }, [index, field, scrollRequest])
  return null
}
