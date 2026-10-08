'use client'

import { useEffect, useRef, useState } from 'react'
import { saveSite } from '@/features/sites/actions'
import type { Site, SiteDocument } from '@/features/sites/types'
import type { Section, Settings } from '@/features/website/types'
import { blockDefinitions } from '@/features/website/blocks'
import { getTemplate } from '@/features/templates/registry'
import { availableAnchor } from '@/features/sites/document'

type Panel = 'sections' | 'preview' | 'properties'
export type EditorAccess = { canEdit: boolean; canPublish: boolean; availableBlocks: string[] | null; planName: string; status: string; graceDaysRemaining: number }

export function useSiteEditor(site: Site, access: EditorAccess) {
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
  const [activeField, setActiveField] = useState<string | null>(null)
  const [recovered, setRecovered] = useState(false)
  const recoveryKey = `forma:draft:${site.id}`
  const initialDocument = useRef(true)
  const dirty = saved !== JSON.stringify(document)
  const section = typeof active === 'number' ? document.sections[active] : null

  useEffect(() => {
    const unload = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault() }
    window.addEventListener('beforeunload', unload)
    return () => window.removeEventListener('beforeunload', unload)
  }, [dirty])

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(recoveryKey)
      if (stored && stored !== JSON.stringify(site.draft)) {
        const parsed = JSON.parse(stored) as SiteDocument
        if (parsed.schemaVersion === 1 && Array.isArray(parsed.sections)) {
          setDocument(parsed)
          setMessage('Recuperamos cambios locales. Guardalos para conservarlos en tu cuenta.')
          setRecovered(true)
        } else if (stored) {
          window.localStorage.removeItem(recoveryKey)
        }
      }
    } catch {
      window.localStorage.removeItem(recoveryKey)
    } finally {
      initialDocument.current = false
    }
  }, [recoveryKey, site.draft])

  useEffect(() => {
    if (initialDocument.current || !dirty) return
    try { window.localStorage.setItem(recoveryKey, JSON.stringify(document)) } catch { /* Storage is optional. */ }
    const timer = window.setTimeout(() => {
      if (!busy) void save(false, true)
    }, 2000)
    return () => window.clearTimeout(timer)
  }, [document, dirty, busy, recoveryKey])

  function change(update: (next: SiteDocument) => void) {
    if (!access.canEdit) { setError('Tu suscripción está vencida. Activá un plan para continuar.'); return }
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
    setActiveField(null)
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
    if (!access.canEdit) { setError('Tu suscripción está vencida. Activá un plan para continuar.'); return }
    if (access.availableBlocks && !access.availableBlocks.includes(type)) { setError(`Este bloque requiere un plan superior a ${access.planName}.`); return }
    if (document.sections.length >= 30) {
      setError('Podés agregar hasta 30 secciones.')
      return
    }
    const sections = getTemplate(document.templateId)?.sections || []
    const template = sections.find(item => item.blockType === type) || blockDefinitions[type].defaults
    change(next => next.sections.push({ ...structuredClone(template), id: crypto.randomUUID(), anchor: availableAnchor(type, next.sections) }))
    select(document.sections.length)
    setTab('sections')
  }

  function duplicate() {
    if (!access.canEdit) return
    if (!section || typeof active !== 'number' || document.sections.length >= 30) return
    if (access.availableBlocks && !access.availableBlocks.includes(section.blockType)) {
      setError(`Este bloque requiere un plan superior a ${access.planName}.`)
      return
    }
    change(next => {
      next.sections.splice(active + 1, 0, { ...structuredClone(section), id: crypto.randomUUID(), anchor: availableAnchor(section.blockType, next.sections) })
    })
    setActive(active + 1)
  }

  function remove() {
    if (!access.canEdit) return
    if (typeof active !== 'number' || document.sections.length <= 1) return
    const nextActive = Math.min(active, document.sections.length - 2)
    change(next => { next.sections.splice(active, 1) })
    setActive(nextActive)
    setActiveField(null)
  }

  function undo() {
    if (!history.length) return
    setFuture([document, ...future])
    setDocument(history[history.length - 1])
    setHistory(history.slice(0, -1))
    setActive(current => typeof current === 'number' && current < history[history.length - 1].sections.length ? current : 'settings')
    setActiveField(null)
  }

  function redo() {
    if (!future.length) return
    setHistory([...history, document])
    setDocument(future[0])
    setFuture(future.slice(1))
    setActive(current => typeof current === 'number' && current < future[0].sections.length ? current : 'settings')
    setActiveField(null)
  }

  async function save(publish: boolean, automatic = false) {
    if (!access.canEdit || (publish && !access.canPublish)) {
      setError(publish ? 'Tu suscripción no permite publicar.' : 'Tu suscripción venció. Activá un plan para guardar.')
      return
    }
    setBusy(true)
    setError('')
    const snapshot = document
    try {
      const result = await saveSite(site.id, snapshot, publish)
      if (result.error) { setError(result.error); return }
      setSaved(JSON.stringify(snapshot))
      try { window.localStorage.removeItem(recoveryKey) } catch { /* Storage is optional. */ }
      setRecovered(false)
      setPublishedAt(result.publishedAt || null)
      setMessage(publish
        ? '¡Tu web está publicada! Abrila con Ver sitio.'
        : automatic ? 'Borrador guardado automáticamente. Tu web pública no cambió.' : 'Borrador guardado. Tu web pública no cambió.')
    } catch {
      setError('No pudimos guardar. Conservamos tus cambios en el editor: intentá nuevamente.')
    } finally {
      setBusy(false)
    }
  }

  return {
    site, access, document, active, section, dirty, message, error, busy, publishedAt, recovered,
    device, tab, panel, activeField, canUndo: history.length > 0, canRedo: future.length > 0,
    change, changeSection, changeSetting, select, move, add, duplicate, remove,
    undo, redo, save, setError, setDevice, setTab, setPanel, setActiveField,
  }
}

export type EditorController = ReturnType<typeof useSiteEditor>
