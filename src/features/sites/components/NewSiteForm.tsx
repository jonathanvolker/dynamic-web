'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { newSite } from '../actions'
import { templates } from '@/features/templates/registry'
import { TemplateThumbnail } from '@/features/templates/components/TemplateThumbnail'
import type { TemplateId } from '@/features/templates/types'

export default function NewSiteForm({ selectedTemplate = 'studio' }: { selectedTemplate?: TemplateId }) {
  const [state, action, pending] = useActionState(newSite, { error: '' })
  return (
    <form action={action} className="p-form">
      <label>Nombre de tu sitio<input name="name" required maxLength={80} placeholder="Por ejemplo: Estudio Aurora" /></label>
      <fieldset className="template-options">
        <legend>Elegí un punto de partida</legend>
        {templates.map(template => (
          <label key={template.id}>
            <input type="radio" name="template" value={template.id} defaultChecked={template.id === selectedTemplate} />
            <TemplateThumbnail template={template} />
            <strong>{template.name} · {template.category}</strong><small>{template.description}</small>
            <Link className="template-choice-preview" href={`/templates/${template.id}`} target="_blank" rel="noreferrer">Ver el diseño completo ↗</Link>
          </label>
        ))}
        <label>
          <input type="radio" name="template" value="blank" />
          <span className="template-art blank">Aa<b>+</b></span>
          <strong>Base simple</strong><small>Portada y contacto. El resto lo decidís vos.</small>
        </label>
      </fieldset>
      {state.error && <p role="alert" className="p-error">{state.error}</p>}
      <button className="p-button primary" disabled={pending}>{pending ? 'Preparando tu espacio…' : 'Empezar a diseñar ↗'}</button>
    </form>
  )
}
