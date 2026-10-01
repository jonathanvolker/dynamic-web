'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { newSite } from '../actions'
import { families, templates } from '@/features/templates/registry'
import { TemplateThumbnail } from '@/features/templates/components/TemplateThumbnail'
import type { FamilyId, TemplateId } from '@/features/website/types'

export default function NewSiteForm({ selectedTemplate = 'studio' }: { selectedTemplate?: TemplateId }) {
  const [state, action, pending] = useActionState(newSite, { error: '' })
  const initialFamily = families.find(family => templates.some(template => template.familyId === family.id && template.id === selectedTemplate))?.id || families[0].id
  const [familyId, setFamilyId] = useState<FamilyId>(initialFamily)
  const [choice, setChoice] = useState<TemplateId | 'blank'>(selectedTemplate)
  const familyTemplates = templates.filter(template => template.familyId === familyId)
  function selectFamily(id: FamilyId) {
    setFamilyId(id)
    if (choice !== 'blank' && !templates.some(template => template.id === choice && template.familyId === id)) setChoice(templates.find(template => template.familyId === id)!.id)
  }
  return (
    <form action={action} className="p-form">
      <label>Nombre de tu sitio<input name="name" required maxLength={80} placeholder="Por ejemplo: Estudio Aurora" /></label>
      <div className="creation-family-switcher" role="tablist" aria-label="Elegir familia visual">
        {families.map(family => <button type="button" role="tab" aria-selected={family.id === familyId} className={family.id === familyId ? 'active' : ''} key={family.id} onClick={() => selectFamily(family.id)}>
          <span>{family.name}</span><small>{templates.filter(template => template.familyId === family.id).length} opciones</small>
        </button>)}
      </div>
      <fieldset className={`template-options creation-template-family family-${familyId}`}>
        <legend>{families.find(family => family.id === familyId)?.name} <small>· elegí una base</small></legend>
        {familyTemplates.map(template => (
          <label key={template.id}>
            <input type="radio" name="template" value={template.id} checked={choice === template.id} onChange={() => setChoice(template.id)} />
            <TemplateThumbnail template={template} />
            <strong>{template.name} · {template.category}</strong><small>{template.description}</small>
            <Link className="template-choice-preview" href={`/templates/${template.id}`} target="_blank" rel="noreferrer">Ver el diseño completo ↗</Link>
          </label>
        ))}
      </fieldset>
      <fieldset className="template-options">
        <legend>Empezar con menos contenido</legend>
        <label>
          <input type="radio" name="template" value="blank" checked={choice === 'blank'} onChange={() => setChoice('blank')} />
          <span className="template-art blank">Aa<b>+</b></span>
          <strong>Base simple</strong><small>Portada y contacto. El resto lo decidís vos.</small>
        </label>
      </fieldset>
      {state.error && <p role="alert" className="p-error">{state.error}</p>}
      <button className="p-button primary" disabled={pending}>{pending ? 'Preparando tu espacio…' : 'Empezar a diseñar ↗'}</button>
    </form>
  )
}
