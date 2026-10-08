import { blockLabels } from '../config/blocks'
import type { EditorController } from '../hooks/use-site-editor'
import { SettingsInspector } from './inspector/SettingsInspector'
import { SectionInspector } from './inspector/SectionInspector'

export function EditorInspector({ editor }: { editor: EditorController }) {
  const title = editor.active === 'settings' ? 'Estilos e identidad'
    : editor.active === 'footer' ? 'Pie de página'
    : editor.section ? blockLabels[editor.section.blockType] : 'Elegí una sección'

  return (
    <aside className={`editor-inspector ${editor.panel === 'properties' ? 'mobile-visible' : ''}`} onFocusCapture={event => {
       const field = (event.target as HTMLElement).closest('[data-editor-field], .editor-field')?.getAttribute('data-editor-field')
      editor.setActiveField(field || null)
    }}>
      <div className="inspector-title"><span className="p-kicker">PERSONALIZAR</span><h2>{title}</h2></div>
        {editor.active === 'settings' || editor.active === 'footer'
         ? <>
           {editor.active === 'settings' && <p className="inspector-explanation">Estos ajustes aplican a todo tu sitio. Para cambiar el contenido de una parte puntual, elegí una sección y editá sus propiedades.</p>}
           <SettingsInspector editor={editor} />
         </>
        : <SectionInspector key={editor.section?.id} editor={editor} />}
    </aside>
  )
}
