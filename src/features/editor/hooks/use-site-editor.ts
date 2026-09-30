'use client'

import { useEffect, useState } from 'react'
import { saveSite } from '@/features/sites/actions'
import type { Site, SiteDocument } from '@/features/sites/types'
import type { Section, Settings } from '@/features/website/types'
import { defaultSections } from '@/features/website/content/defaults'
import { getTemplate } from '@/features/templates/registry'

type Panel = 'sections' | 'preview' | 'properties'

export function useSiteEditor(site: Site) {
  const [document, setDocument] = useState<SiteDocument>(site.draft)
  const [active, setActive] = useState<number | 'settings'>(0)
  const [history, setHistory] = useState<SiteDocument[]>([])
  const [future, setFuture] = useState<SiteDocument[]>([])
  const [saved, setSaved] = useState(JSON.stringify(site.draft))
  const [message, setMessage] = useState('Tus cambios se guardan al pulsar Guardar.')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [publishedAt, setPublishedAt] = useState(site.published_at)
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [tab, setTab] = useState<'sections' | 'add'>('sections')
  const [panel, setPanel] = useState<Panel>('preview')
  const dirty = saved !== JSON.stringify(document)
  const section = typeof active === 'number' ? document.sections[active] : null

  useEffect(() => {
    const unload = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault() }
    window.addEventListener('beforeunload', unload)
    return () => window.removeEventListener('beforeunload', unload)
  }, [dirty])

  function change(update: (next: SiteDocument) => void) {
    const next = structuredClone(document)
    update(next)
    setHistory(previous => [...previous.slice(-19), document])
    setFuture([])
    setDocument(next)
    setError('')
  }

  function changeSection(name: string, value: unknown) {
    if (typeof active !== 'number') return
    change(next => { Object.assign(next.sections[active], { [name]: value }) })
  }

  function changeSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    change(next => { next.settings[key] = value })
  }

  function select(index: number | 'settings') {
    setActive(index)
    setPanel('properties')
  }

  function move(index: number, to: number) {
    if (to < 0 || to >= document.sections.length || index === to) return
    change(next => {
      const [item] = next.sections.splice(index, 1)
      next.sections.splice(to, 0, item)
    })
    setActive(to)
  }

  function add(type: Section['blockType']) {
    if (document.sections.length >= 30) {
      setError('Podés agregar hasta 30 secciones.')
      return
    }
    const sections = getTemplate(document.settings.template || 'studio')?.sections || defaultSections
    const template = sections.find(item => item.blockType === type) || defaultSections.find(item => item.blockType === type)!
    change(next => next.sections.push({ ...structuredClone(template), id: crypto.randomUUID() }))
    select(document.sections.length)
    setTab('sections')
  }

  function duplicate() {
    if (!section || typeof active !== 'number' || document.sections.length >= 30) return
    change(next => {
      next.sections.splice(active + 1, 0, { ...structuredClone(section), id: crypto.randomUUID() })
    })
    setActive(active + 1)
  }

  function remove() {
    if (typeof active !== 'number' || document.sections.length <= 1) return
    if (!window.confirm('¿Eliminar esta sección? Podés deshacer la acción.')) return
    change(next => { next.sections.splice(active, 1) })
    setActive(0)
  }

  function undo() {
    if (!history.length) return
    setFuture([document, ...future])
    setDocument(history[history.length - 1])
    setHistory(history.slice(0, -1))
    setActive('settings')
  }

  function redo() {
    if (!future.length) return
    setHistory([...history, document])
    setDocument(future[0])
    setFuture(future.slice(1))
    setActive('settings')
  }

  async function save(publish: boolean) {
    setBusy(true)
    setError('')
    const snapshot = document
    try {
      const result = await saveSite(site.id, snapshot, publish)
      if (result.error) { setError(result.error); return }
      setSaved(JSON.stringify(snapshot))
      setPublishedAt(result.publishedAt || null)
      setMessage(publish
        ? '¡Tu web está publicada! Abrila con Ver sitio.'
        : 'Borrador guardado. Tu web pública no cambió.')
    } catch {
      setError('No pudimos guardar. Conservamos tus cambios en el editor: intentá nuevamente.')
    } finally {
      setBusy(false)
    }
  }

  return {
    site, document, active, section, dirty, message, error, busy, publishedAt,
    device, tab, panel, canUndo: history.length > 0, canRedo: future.length > 0,
    change, changeSection, changeSetting, select, move, add, duplicate, remove,
    undo, redo, save, setError, setDevice, setTab, setPanel,
  }
}

export type EditorController = ReturnType<typeof useSiteEditor>
