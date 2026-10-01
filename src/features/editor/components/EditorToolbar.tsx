import Link from 'next/link'
import type { EditorController } from '../hooks/use-site-editor'
import { useState } from 'react'
import { Modal } from '@/features/platform/components/Modal'

export function EditorToolbar({ editor }: { editor: EditorController }) {
  const [leaveConfirm, setLeaveConfirm] = useState(false)
  const [leave, setLeave] = useState<(() => void) | null>(null)
  return (
    <header className="editor-toolbar">
      <div className="editor-identity">
        <Link href="/dashboard" aria-label="Volver a mis sitios" onClick={event => {
          if (editor.dirty) {
            event.preventDefault()
            setLeave(() => () => { window.location.href = '/dashboard' })
            setLeaveConfirm(true)
          }
        }}>←</Link>
        <span className="p-logo">forma<span>✳</span></span>
        <div><strong>{editor.site.name}</strong><small>{editor.dirty ? '● Cambios sin guardar' : '✓ Guardado'}</small></div>
      </div>
      <div className="editor-tools">
        <button onClick={editor.undo} disabled={!editor.canUndo} aria-label="Deshacer" title="Deshacer">↶</button>
        <button onClick={editor.redo} disabled={!editor.canRedo} aria-label="Rehacer" title="Rehacer">↷</button>
        <div className="device-controls">
          <button aria-label="Vista escritorio" aria-pressed={editor.device === 'desktop'} onClick={() => editor.setDevice('desktop')}>▱</button>
          <button aria-label="Vista móvil" aria-pressed={editor.device === 'mobile'} onClick={() => editor.setDevice('mobile')}>▯</button>
        </div>
      </div>
      <div className="editor-publish">
        {editor.publishedAt && <><span className="publish-pill">Publicado</span><a className="text-link" href={`/s/${editor.site.slug}`} target="_blank" rel="noreferrer">Ver sitio ↗</a></>}
        <button type="button" className="p-button secondary" onClick={() => editor.save(false)} disabled={editor.busy}>{editor.busy ? 'Guardando…' : 'Guardar'}</button>
        <button type="button" className="p-button primary" onClick={() => editor.save(true)} disabled={editor.busy}>{editor.busy ? 'Publicando…' : editor.publishedAt ? 'Actualizar publicación ↗' : 'Publicar ↗'}</button>
      </div>
      <Modal open={leaveConfirm} title="Tenés cambios sin guardar" description="Si salís ahora, los cambios que todavía no se hayan guardado quedarán solo en este dispositivo." confirmLabel="Salir sin guardar" tone="danger" onConfirm={() => { leave?.(); setLeaveConfirm(false) }} onCancel={() => setLeaveConfirm(false)} />
    </header>
  )
}
