'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { SiteDocument } from '@/features/sites/types'

export function useLivePreview(document: SiteDocument, onSelect: (index: number | 'footer') => void, active: number | 'settings' | 'footer', activeField: string | null) {
  const iframe = useRef<HTMLIFrameElement>(null)
  const latest = useRef({ document, onSelect })
  latest.current = { document, onSelect }

  const sendPreview = useCallback(() => {
    iframe.current?.contentWindow?.postMessage({
      type: 'forma:preview', document: latest.current.document,
    }, window.location.origin)
  }, [])

  useEffect(() => { sendPreview() }, [document, sendPreview])
  useEffect(() => {
    iframe.current?.contentWindow?.postMessage({ type: 'forma:highlight', index: active, field: activeField }, window.location.origin)
  }, [active, activeField])
  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== iframe.current?.contentWindow) return
      if (event.data?.type === 'forma:ready') sendPreview()
      const index = event.data?.index
      if (event.data?.type === 'forma:select' && index === 'footer') {
        latest.current.onSelect(index)
      } else if (event.data?.type === 'forma:select' && Number.isInteger(index)
        && index >= 0 && index < latest.current.document.sections.length) {
        latest.current.onSelect(index)
      }
    }
    window.addEventListener('message', listener)
    return () => window.removeEventListener('message', listener)
  }, [sendPreview])

  return { iframe, sendPreview }
}
