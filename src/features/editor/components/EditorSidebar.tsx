import { blockLabels, blockSymbols, blockTypesForFamily, descriptionForBlock, labelForBlock } from '../config/blocks'
import type { EditorController } from '../hooks/use-site-editor'

export function EditorSidebar({ editor }: { editor: EditorController }) {
  const allTypes = blockTypesForFamily(editor.document.familyId)
  const availableTypes = allTypes.filter(type => !editor.access.availableBlocks || editor.access.availableBlocks.includes(type))
  const hiddenBlockCount = allTypes.length - availableTypes.length
  return (
    <aside className={`editor-sidebar ${editor.panel === 'sections' ? 'mobile-visible' : ''}`}>
      <div className="sidebar-tabs">
        <button className={editor.tab === 'sections' ? 'active' : ''} onClick={() => editor.setTab('sections')}>Secciones</button>
        <button className={editor.tab === 'add' ? 'active' : ''} onClick={() => editor.setTab('add')}>+ Agregar</button>
      </div>
      {editor.tab === 'sections' ? (
        <>
          <p className="sidebar-hint">Arrastrá para ordenar. Tocá para editar.</p>
          <div className="section-list">
            {editor.document.sections.map((item, index) => (
              <div
                key={item.id || index}
                 draggable={editor.access.availableBlocks?.includes(item.blockType) !== false}
                 className={`section-item ${editor.active === index ? 'selected' : ''} ${editor.access.availableBlocks?.includes(item.blockType) === false ? 'section-item-locked' : ''}`}
                 onDragStart={event => { if (editor.access.availableBlocks?.includes(item.blockType) === false) { event.preventDefault(); return } event.dataTransfer.setData('text/plain', String(index)) }}
                onDragOver={event => event.preventDefault()}
                onDrop={event => {
                  event.preventDefault()
                  const from = Number(event.dataTransfer.getData('text/plain'))
                  if (editor.access.availableBlocks?.includes(item.blockType) === false) return
                  if (Number.isInteger(from) && from >= 0 && from < editor.document.sections.length) editor.move(from, index)
                }}
              >
                 <button className="section-select" onClick={() => editor.select(index)} aria-disabled={editor.access.availableBlocks?.includes(item.blockType) === false}>
                   <span>{blockSymbols[item.blockType]}</span>
                   <span>{blockLabels[item.blockType]}{editor.access.availableBlocks?.includes(item.blockType) === false && <em className="section-lock-label"> · Conservada</em>}<small>{item.title.split('\n')[0].slice(0, 27)}</small></span>
                </button>
                <div className="section-order">
                   <button aria-label={`Subir ${blockLabels[item.blockType]}`} onClick={() => editor.move(index, index - 1)} disabled={index === 0 || editor.access.availableBlocks?.includes(item.blockType) === false}>↑</button>
                   <button aria-label={`Bajar ${blockLabels[item.blockType]}`} onClick={() => editor.move(index, index + 1)} disabled={index === editor.document.sections.length - 1 || editor.access.availableBlocks?.includes(item.blockType) === false}>↓</button>
                </div>
              </div>
            ))}
          </div>
          <button className="sidebar-add" onClick={() => editor.setTab('add')}>+ Agregar sección</button>
        </>
      ) : (
        <div className="block-library">
          <p className="sidebar-hint">Bloques diseñados para combinar bien.</p>
          {availableTypes.map(type => (
            <button key={type} onClick={() => editor.add(type)}>
              <span>{blockSymbols[type]}</span><strong>{labelForBlock(type, editor.document.familyId)}</strong><small>{descriptionForBlock(type, editor.document.familyId)}</small>
            </button>
          ))}
          {hiddenBlockCount > 0 && <p className="upgrade-note">Hay {hiddenBlockCount} bloques más disponibles en planes superiores. <a href="/planes">Mejorar plan ↗</a></p>}
        </div>
      )}
      <button className={`site-settings-button ${editor.active === 'settings' ? 'selected' : ''}`} onClick={() => editor.select('settings')}>⚙ Identidad y ajustes</button>
      <div className="sidebar-domain">
        <span>◎ DIRECCIÓN DE TU SITIO</span><p>/s/{editor.site.slug}</p>
        <small>{editor.publishedAt ? 'Tu sitio está publicado.' : 'Publicá para activar esta dirección.'}</small>
      </div>
    </aside>
  )
}
