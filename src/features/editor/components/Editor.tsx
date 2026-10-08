'use client'

import type { Site } from '@/features/sites/types'
import { useSiteEditor } from '../hooks/use-site-editor'
import type { EditorAccess } from '../hooks/use-site-editor'
import { EditorToolbar } from './EditorToolbar'
import { EditorSidebar } from './EditorSidebar'
import { EditorCanvas } from './EditorCanvas'
import { EditorInspector } from './EditorInspector'

/** Layout only: state and document mutations live in useSiteEditor. */
export default function Editor({ site, access }: { site: Site; access: EditorAccess }) {
  const editor = useSiteEditor(site, access)

  return (
    <div className={`platform editor-shell ${!access.canEdit ? 'editor-locked' : ''}`}>
      {!access.canEdit && <div className="editor-lock-banner">Tu suscripción venció. El sitio fue retirado de publicación. <a href="/planes">Elegí un plan para continuar ↗</a></div>}
      {access.status === 'past_due' && <div className="editor-lock-banner warning">Tu pago está pendiente. Tenés {access.graceDaysRemaining} días para regularizarlo antes de retirar la publicación. <a href="/planes">Ver planes ↗</a></div>}
      <EditorToolbar editor={editor} />
       <div className="editor-mobile-tabs">
           <button type="button" aria-selected={editor.panel === 'sections'} className={editor.panel === 'sections' ? 'active' : ''} onClick={() => { if (editor.active === 'settings') editor.select(0); editor.setPanel('sections') }}>Secciones</button>
           <button type="button" aria-selected={editor.panel === 'properties' && editor.active !== 'settings'} className={editor.panel === 'properties' && editor.active !== 'settings' ? 'active' : ''} onClick={() => editor.setPanel('properties')}>Propiedades</button>
           <button type="button" aria-selected={editor.active === 'settings'} className={editor.active === 'settings' ? 'active' : ''} onClick={() => editor.select('settings')}>Estilos</button>
           <button type="button" aria-selected={editor.panel === 'preview'} className={editor.panel === 'preview' ? 'active' : ''} onClick={() => editor.setPanel('preview')}>Vista previa</button>
        </div>
       <div className="editor-body">
        <EditorSidebar editor={editor} />
        <EditorCanvas editor={editor} />
        <EditorInspector editor={editor} />
      </div>
    </div>
  )
}
