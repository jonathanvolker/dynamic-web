'use client'

import { useState } from 'react'
import { blockLabels, blockSymbols, blockTypesForFamily, descriptionForBlock, labelForBlock } from '../config/blocks'
import type { EditorController } from '../hooks/use-site-editor'
import { Modal } from '@/features/platform/components/Modal'

export function EditorSidebar({ editor }: { editor: EditorController }) {
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)
  const deleteSection = deleteIndex === null ? null : editor.document.sections[deleteIndex]
  return (
    <aside className={`editor-sidebar ${editor.panel === 'sections' ? 'mobile-visible' : ''}`}>
      <div className="sidebar-tabs">
        <button type="button" className={editor.tab === 'sections' ? 'active' : ''} onClick={() => editor.setTab('sections')}>Secciones</button>
        <button type="button" className={editor.tab === 'add' ? 'active' : ''} onClick={() => editor.setTab('add')}>+ Agregar</button>
        <button type="button" className={editor.tab === 'styles' ? 'active' : ''} onClick={() => { editor.setTab('styles'); editor.select('settings') }}>Estilos</button>
      </div>
      {editor.error && <p className="sidebar-error" role="alert">{editor.error}</p>}
      {editor.tab === 'sections' ? (
        <>
          <p className="sidebar-hint">Arrastrá para ordenar. Tocá para editar.</p>
          <div className="section-list">
            {editor.document.sections.map((item, index) => (
              <div
                key={item.id || index}
                draggable
                className={`section-item ${editor.active === index ? 'selected' : ''}`}
                onDragStart={event => event.dataTransfer.setData('text/plain', String(index))}
                onDragOver={event => event.preventDefault()}
                onDrop={event => {
                  event.preventDefault()
                  const from = Number(event.dataTransfer.getData('text/plain'))
                  if (Number.isInteger(from) && from >= 0 && from < editor.document.sections.length) editor.move(from, index)
                }}
              >
                <button type="button" className="section-select" onClick={() => editor.select(index)}>
                  <span>{blockSymbols[item.blockType]}</span>
                  <span>{blockLabels[item.blockType]}<small>{item.title.split('\n')[0].slice(0, 27)}</small></span>
                </button>
                <div className="section-order">
                   <button type="button" aria-label={`Subir ${blockLabels[item.blockType]}`} onClick={() => editor.move(index, index - 1)} disabled={index === 0}>↑</button>
                   <button type="button" aria-label={`Bajar ${blockLabels[item.blockType]}`} onClick={() => editor.move(index, index + 1)} disabled={index === editor.document.sections.length - 1}>↓</button>
                   <button type="button" className="section-delete" aria-label={`Eliminar ${blockLabels[item.blockType]}`} onClick={event => { event.stopPropagation(); if (editor.document.sections.length > 1) setDeleteIndex(index) }} disabled={editor.document.sections.length <= 1}>🗑</button>
                 </div>
              </div>
            ))}
          </div>
          <button type="button" className="sidebar-add" onClick={() => editor.setTab('add')}>+ Agregar sección</button>
        </>
      ) : editor.tab === 'add' ? (
        <div className="block-library">
          <p className="sidebar-hint">Bloques diseñados para combinar bien.</p>
          {blockTypesForFamily(editor.document.familyId).map(type => (
            <button type="button" key={type} onClick={() => editor.add(type)}>
              <span>{blockSymbols[type]}</span><strong>{labelForBlock(type, editor.document.familyId)}</strong><small>{descriptionForBlock(type, editor.document.familyId)}</small>
            </button>
          ))}
        </div>
      ) : <div className="styles-sidebar"><p className="sidebar-hint">Configurá la identidad, los colores, la tipografía y el menú desde el panel de propiedades.</p></div>}
      <div className="sidebar-domain">
        <span>◎ DIRECCIÓN DE TU SITIO</span><p>/s/{editor.site.slug}</p>
        <small>{editor.publishedAt ? 'Tu sitio está publicado.' : 'Publicá para activar esta dirección.'}</small>
      </div>
      <Modal
        open={deleteIndex !== null}
        title="¿Eliminar esta sección?"
        description={deleteSection ? `Se va a eliminar “${blockLabels[deleteSection.blockType]}”. Esta acción quedará en el borrador y podrás deshacerla.` : ''}
        confirmLabel="Eliminar sección"
        tone="danger"
        onCancel={() => setDeleteIndex(null)}
        onConfirm={() => { if (deleteIndex !== null) editor.remove(deleteIndex); setDeleteIndex(null) }}
      />
    </aside>
  )
}
