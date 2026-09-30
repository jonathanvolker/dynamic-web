'use client'

import type { Site } from '@/features/sites/types'
import { useSiteEditor } from '../hooks/use-site-editor'
import { EditorToolbar } from './EditorToolbar'
import { EditorSidebar } from './EditorSidebar'
import { EditorCanvas } from './EditorCanvas'
import { EditorInspector } from './EditorInspector'

/** Layout only: state and document mutations live in useSiteEditor. */
export default function Editor({ site }: { site: Site }) {
  const editor = useSiteEditor(site)

  return (
    <div className="platform editor-shell">
      <EditorToolbar editor={editor} />
      <div className="editor-mobile-tabs">
        <button onClick={() => editor.setPanel('sections')}>Secciones</button>
        <button onClick={() => editor.setPanel('preview')}>Vista previa</button>
        <button onClick={() => editor.setPanel('properties')}>Propiedades</button>
      </div>
      <div className="editor-body">
        <EditorSidebar editor={editor} />
        <EditorCanvas editor={editor} />
        <EditorInspector editor={editor} />
      </div>
    </div>
  )
}
