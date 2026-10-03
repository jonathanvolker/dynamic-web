import { blockLabels } from '../config/blocks'
import type { EditorController } from '../hooks/use-site-editor'
import { SettingsInspector } from './inspector/SettingsInspector'
import { SectionInspector } from './inspector/SectionInspector'

export function EditorInspector({ editor }: { editor: EditorController }) {
  const title = editor.active === 'settings' ? 'Estilos'
    : editor.section ? blockLabels[editor.section.blockType] : 'Elegí una sección'

  return (
    <aside className={`editor-inspector ${editor.panel === 'properties' ? 'mobile-visible' : ''}`}>
      <div className="inspector-title"><span className="p-kicker">PERSONALIZAR</span><h2>{title}</h2></div>
      {editor.active === 'settings'
        ? <SettingsInspector editor={editor} />
        : <SectionInspector key={editor.section?.id} editor={editor} />}
    </aside>
  )
}
