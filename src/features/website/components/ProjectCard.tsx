'use client'

import { useEffect, useId, useRef } from 'react'
import type { Project } from '../types'

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  const openDialog = () => dialog.current?.showModal()
  const closeDialog = () => dialog.current?.close()
  useEffect(() => {
    const element = dialog.current
    if (!element) return
    const restoreFocus = () => trigger.current?.focus()
    element.addEventListener('close', restoreFocus)
    return () => element.removeEventListener('close', restoreFocus)
  }, [])
  return <>
    <button ref={trigger} type="button" className="project-card" onClick={openDialog} aria-label={`Ver proyecto ${project.title}`}>
       <div className={`project-art ${project.tone}`} data-forma-field={`projects.${index}.image`}>
        {project.image?.url ? <img src={project.image.url} alt={project.image.alt || project.title} /> : <>
          <span className="art-caption">{project.category}</span>
          <span className="art-shape" aria-hidden="true" />
          <span className="art-word">{project.title}{project.tone === 'purple' ? '®' : '.'}</span>
          <span className="art-small">SELECCIÓN / {String(index + 1).padStart(2, '0')}</span>
        </>}
        <span className="project-open" aria-hidden="true">↗</span>
      </div>
       <div className="project-caption"><h3 data-forma-field={`projects.${index}.title`}>{project.title}</h3><span data-forma-field={`projects.${index}.category`}>{project.category}</span></div>
    </button>
    <dialog ref={dialog} className="project-dialog" aria-labelledby={titleId} aria-describedby={descriptionId} onCancel={event => { event.preventDefault(); closeDialog() }} onClick={(event) => { if (event.target === event.currentTarget) closeDialog() }}>
      <div className="dialog-content"><button type="button" className="dialog-close" onClick={closeDialog} aria-label="Cerrar proyecto">×</button><span className="eyebrow">{project.category}</span><h2 id={titleId}>{project.title}</h2><p id={descriptionId}>{project.description}</p><button type="button" className="button dark" onClick={closeDialog}>Volver a proyectos <span aria-hidden="true">↙</span></button></div>
    </dialog>
  </>
}
