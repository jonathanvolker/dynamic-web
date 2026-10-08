'use client'

import { useState } from 'react'
import type { SectionProps } from './types'
import { SectionHeading } from './SectionHeading'

export function LeadFormSection({ section, anchor, siteSlug, preview }: SectionProps) {
  const [state, setState] = useState<'idle' | 'busy' | 'success' | 'error'>('idle')
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState('busy')
    const form = event.currentTarget
    try {
      const response = await fetch('/api/public/leads', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ siteSlug, kind: 'contact', formId: section.id || anchor, values: Object.fromEntries(new FormData(form).entries()) }) })
      setState(response.ok ? 'success' : 'error')
      if (response.ok) form.reset()
    } catch { setState('error') }
  }
  return <section id={anchor} className="section wrap lead-block"><SectionHeading section={section} /><form onSubmit={preview ? event => event.preventDefault() : submit} className="lead-form"><div className="honeypot" aria-hidden="true"><label>Dejar vacío<input name="website" tabIndex={-1} autoComplete="off" /></label></div>{section.formFields?.map((field, index) => <label key={field.name} data-forma-field={`formFields.${index}.label`}>{field.label}{field.type === 'textarea' ? <textarea name={field.name} required={field.required} rows={5} /> : <input type={field.type} name={field.name} required={field.required} />}</label>)}<button className="button dark" data-forma-field="formSubmitLabel" disabled={preview || state === 'busy'}>{preview ? 'Disponible al publicar' : state === 'busy' ? 'Enviando…' : section.formSubmitLabel || 'Enviar'}</button>{state === 'success' && <p role="status" data-forma-field="formSuccessMessage">{section.formSuccessMessage || 'Recibimos tu consulta.'}</p>}{state === 'error' && <p role="alert">No pudimos enviar el formulario. Intentá nuevamente.</p>}</form></section>
}

export function NewsletterSection({ section, anchor, siteSlug, preview }: SectionProps) {
  const [state, setState] = useState<'idle' | 'busy' | 'success' | 'error'>('idle')
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState('busy')
    const form = event.currentTarget
    try {
      const response = await fetch('/api/public/leads', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ siteSlug, kind: 'newsletter', formId: section.id || anchor, values: Object.fromEntries(new FormData(form).entries()) }) })
      setState(response.ok ? 'success' : 'error')
      if (response.ok) form.reset()
    } catch { setState('error') }
  }
  return <section id={anchor} className="section wrap newsletter-block"><div><p className="eyebrow" data-forma-field="eyebrow">{section.eyebrow}</p><h2 data-forma-field="title">{section.title}</h2><p data-forma-field="description">{section.description}</p></div><form onSubmit={preview ? event => event.preventDefault() : submit}><label data-forma-field="newsletterLabel">{section.newsletterLabel || 'Email'}<input type="email" name="email" required /></label><label className="consent" data-forma-field="newsletterConsent"><input type="checkbox" name="consent" required />{section.newsletterConsent || 'Acepto recibir novedades.'}</label><button className="button dark" data-forma-field="formSubmitLabel" disabled={preview || state === 'busy'}>{preview ? 'Disponible al publicar' : state === 'busy' ? 'Guardando…' : section.formSubmitLabel || 'Suscribirme'}</button>{state === 'success' && <p role="status" data-forma-field="formSuccessMessage">{section.formSuccessMessage || 'Suscripción registrada.'}</p>}{state === 'error' && <p role="alert">No pudimos registrar tu email.</p>}</form></section>
}
