'use client'

import { useRef } from 'react'
import type { Project } from '../types'

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const dialog = useRef<HTMLDialogElement>(null)
  return <>
    <button className="project-card" onClick={() => dialog.current?.showModal()} aria-label={`Ver proyecto ${project.title}`}>
      <div className={`project-art ${project.tone}`}>
        {project.image?.url ? <img src={project.image.url} alt={project.image.alt || project.title} /> : <>
          <span className="art-caption">{project.category}</span>
          <span className="art-shape" aria-hidden="true" />
          <span className="art-word">{project.title}{project.tone === 'purple' ? '®' : '.'}</span>
          <span className="art-small">SELECCIÓN / {String(index + 1).padStart(2, '0')}</span>
        </>}
        <span className="project-open" aria-hidden="true">↗</span>
      </div>
      <div className="project-caption"><h3>{project.title}</h3><span>{project.category}</span></div>
    </button>
    <dialog ref={dialog} className="project-dialog" onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close() }}>
      <div className="dialog-content"><button className="dialog-close" onClick={() => dialog.current?.close()} aria-label="Cerrar proyecto">×</button><span className="eyebrow">{project.category}</span><h2>{project.title}</h2><p>{project.description}</p><button className="button dark" onClick={() => dialog.current?.close()}>Volver a proyectos <span>↙</span></button></div>
    </dialog>
  </>
}
