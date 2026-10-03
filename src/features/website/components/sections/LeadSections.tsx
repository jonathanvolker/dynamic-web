'use client'

import { useState } from 'react'
import type { SectionProps } from './types'
import { SectionHeading } from './SectionHeading'

export function LeadFormSection({ section, anchor, siteSlug }: SectionProps) {
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
  return <section id={anchor} className="section wrap lead-block"><SectionHeading section={section} /><form onSubmit={submit} className="lead-form"><div className="honeypot" aria-hidden="true"><label>Dejar vacío<input name="website" tabIndex={-1} autoComplete="off" /></label></div>{section.formFields?.map(field => <label key={field.name}>{field.label}{field.type === 'textarea' ? <textarea name={field.name} required={field.required} rows={5} /> : <input type={field.type} name={field.name} required={field.required} />}</label>)}<button className="button dark" disabled={state === 'busy'}>{state === 'busy' ? 'Enviando…' : section.formSubmitLabel || 'Enviar'}</button>{state === 'success' && <p role="status">{section.formSuccessMessage || 'Recibimos tu consulta.'}</p>}{state === 'error' && <p role="alert">No pudimos enviar el formulario. Intentá nuevamente.</p>}</form></section>
}

export function NewsletterSection({ section, anchor, siteSlug }: SectionProps) {
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
  return <section id={anchor} className="section wrap newsletter-block"><div><p className="eyebrow">{section.eyebrow}</p><h2>{section.title}</h2><p>{section.description}</p></div><form onSubmit={submit}><label>{section.newsletterLabel || 'Email'}<input type="email" name="email" required /></label><label className="consent"><input type="checkbox" name="consent" required />{section.newsletterConsent || 'Acepto recibir novedades.'}</label><button className="button dark" disabled={state === 'busy'}>{state === 'busy' ? 'Guardando…' : section.formSubmitLabel || 'Suscribirme'}</button>{state === 'success' && <p role="status">{section.formSuccessMessage || 'Suscripción registrada.'}</p>}{state === 'error' && <p role="alert">No pudimos registrar tu email.</p>}</form></section>
}
