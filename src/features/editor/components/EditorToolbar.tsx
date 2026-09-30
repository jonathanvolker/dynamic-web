import Link from 'next/link'
import type { EditorController } from '../hooks/use-site-editor'

export function EditorToolbar({ editor }: { editor: EditorController }) {
  return (
    <header className="editor-toolbar">
      <div className="editor-identity">
        <Link href="/dashboard" aria-label="Volver a mis sitios" onClick={event => {
          if (editor.dirty && !window.confirm('Tenés cambios sin guardar. ¿Querés salir?')) event.preventDefault()
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
        {editor.publishedAt && <a className="text-link" href={`/s/${editor.site.slug}`} target="_blank" rel="noreferrer">Ver sitio ↗</a>}
        <button className="p-button secondary" onClick={() => editor.save(false)} disabled={editor.busy}>{editor.busy ? 'Guardando…' : 'Guardar'}</button>
        <button className="p-button primary" onClick={() => editor.save(true)} disabled={editor.busy}>{editor.busy ? 'Un momento…' : 'Publicar ↗'}</button>
      </div>
    </header>
  )
}
