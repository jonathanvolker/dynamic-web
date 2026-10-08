import type { EditorController } from '../hooks/use-site-editor'
import { useLivePreview } from '../hooks/use-live-preview'

export function EditorCanvas({ editor }: { editor: EditorController }) {
  const { iframe, sendPreview } = useLivePreview(editor.document, editor.select, editor.active, editor.activeField)
  return (
    <section className={`editor-canvas ${editor.panel === 'preview' ? 'mobile-visible' : ''}`}>
      <div className="canvas-label">
        <span>VISTA PREVIA EN VIVO</span>
          <span>{editor.device === 'mobile' ? '390 px · Móvil' : 'Escritorio'} · Hacé clic en una sección o en el pie para editar</span>
      </div>
       <div className={`preview-frame ${editor.device}`}>
         <iframe ref={iframe} src="/preview" title="Vista previa de tu web" onLoad={() => {
           sendPreview()
           iframe.current?.contentWindow?.postMessage({ type: 'forma:highlight', index: editor.active, field: editor.activeField }, window.location.origin)
           iframe.current?.contentWindow?.postMessage({ type: 'forma:scroll-to', index: editor.active, field: editor.activeField }, window.location.origin)
         }} />
      </div>
       <div className={`editor-status ${editor.error ? 'error' : ''}`} role={editor.error ? 'alert' : 'status'} aria-live="polite">
        {editor.error || editor.message}
      </div>
    </section>
  )
}
