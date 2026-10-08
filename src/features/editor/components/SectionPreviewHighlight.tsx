'use client'

import { useEffect, useRef } from 'react'

export function SectionPreviewHighlight({ field }: { field: string | null }) {
  const marker = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const container = marker.current?.closest('.section-live-preview')
    if (!container) return
    container.querySelectorAll('[data-forma-highlight="true"]').forEach(element => element.removeAttribute('data-forma-highlight'))
    if (!field) return
    const escaped = CSS.escape(field)
    const parent = field.split('.').slice(0, -1).join('.')
    const target = container.querySelector(`[data-forma-field="${escaped}"]`) || (parent ? container.querySelector(`[data-forma-field="${CSS.escape(parent)}"]`) : null)
    target?.setAttribute('data-forma-highlight', 'true')
    if (!target) return
    const previewViewport = container.querySelector(':scope > div') as HTMLElement | null
    if (!previewViewport) return
    requestAnimationFrame(() => {
      const targetRect = target.getBoundingClientRect()
      const viewportRect = previewViewport.getBoundingClientRect()
      const targetCenter = targetRect.top + targetRect.height / 2
      const viewportCenter = viewportRect.top + previewViewport.clientHeight / 2
      previewViewport.scrollTop += targetCenter - viewportCenter
    })
  }, [field])

  return <span ref={marker} aria-hidden="true" />
}
