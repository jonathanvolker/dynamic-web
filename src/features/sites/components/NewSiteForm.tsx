'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { newSite } from '../actions'
import { families, templates } from '@/features/templates/registry'
import { TemplateThumbnail } from '@/features/templates/components/TemplateThumbnail'
import type { FamilyId, TemplateId } from '@/features/website/types'

export default function NewSiteForm({ selectedTemplate = 'studio' }: { selectedTemplate?: TemplateId | 'blank' }) {
  const [state, action, pending] = useActionState(newSite, { error: '' })
  const initialFamily = families.find(family => templates.some(template => template.familyId === family.id && template.id === selectedTemplate))?.id || families[0].id
  const [familyId, setFamilyId] = useState<FamilyId>(initialFamily)
  const [choice, setChoice] = useState<TemplateId | 'blank'>(selectedTemplate)
  const carouselRef = useRef<HTMLFieldSetElement>(null)
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [activeTemplate, setActiveTemplate] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  const familyTemplates = templates.filter(template => template.familyId === familyId)

  function pauseCarousel() {
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current)
    pauseTimeoutRef.current = setTimeout(() => { pauseTimeoutRef.current = null }, 3000)
  }

  function carouselCards() {
    return Array.from(carouselRef.current?.querySelectorAll<HTMLElement>('[data-carousel-card]') || [])
  }

  function moveToTemplate(index: number) {
    const cards = carouselCards()
    const target = cards[familyTemplates.length + index]
    if (!target || !carouselRef.current) return
    pauseCarousel()
    setActiveTemplate(index)
    carouselRef.current.scrollTo({ left: target.offsetLeft, behavior: reducedMotion ? 'auto' : 'smooth' })
  }

  function handleCarouselScroll() {
    const carousel = carouselRef.current
    const cards = carouselCards()
    if (!carousel || cards.length < familyTemplates.length * 3) return
    const firstCopyStart = cards[0].offsetLeft
    const copyWidth = cards[familyTemplates.length].offsetLeft - firstCopyStart
    if (carousel.scrollLeft < copyWidth / 2) carousel.scrollLeft += copyWidth
    if (carousel.scrollLeft > copyWidth * 2.5) carousel.scrollLeft -= copyWidth
    const cardWidth = cards[1].offsetLeft - cards[0].offsetLeft
    const index = Math.round((carousel.scrollLeft - firstCopyStart - copyWidth) / cardWidth)
    setActiveTemplate((index % familyTemplates.length + familyTemplates.length) % familyTemplates.length)
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotionPreference = () => setReducedMotion(mediaQuery.matches)
    updateMotionPreference()
    mediaQuery.addEventListener('change', updateMotionPreference)
    return () => mediaQuery.removeEventListener('change', updateMotionPreference)
  }, [])

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel || reducedMotion) return
    const interval = window.setInterval(() => {
      if (pauseTimeoutRef.current) return
      carousel.scrollLeft += 0.5
    }, 30)
    return () => window.clearInterval(interval)
  }, [familyId, reducedMotion])

  useEffect(() => {
    const carousel = carouselRef.current
    const cards = carouselCards()
    if (!carousel || cards.length < familyTemplates.length * 3) return
    const copyWidth = cards[familyTemplates.length].offsetLeft - cards[0].offsetLeft
    carousel.scrollLeft = copyWidth + cards[0].offsetLeft
    setActiveTemplate(0)
  }, [familyId, familyTemplates.length])

  useEffect(() => () => { if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current) }, [])
  function selectFamily(id: FamilyId) {
    setFamilyId(id)
    if (choice !== 'blank' && !templates.some(template => template.id === choice && template.familyId === id)) setChoice(templates.find(template => template.familyId === id)!.id)
  }
  return (
    <form action={action} className="p-form">
       <label>¿Cómo se llama tu sitio?<input name="name" required maxLength={80} placeholder="Por ejemplo: Estudio Aurora" /></label>
       <div className="creation-family-switcher" role="tablist" aria-label="Elegí un estilo">
        {families.map(family => <button type="button" role="tab" aria-selected={family.id === familyId} className={family.id === familyId ? 'active' : ''} key={family.id} onClick={() => selectFamily(family.id)}>
           <span>{family.name}</span><small>{templates.filter(template => template.familyId === family.id).length} plantillas</small>
        </button>)}
      </div>
       <fieldset ref={carouselRef} onScroll={handleCarouselScroll} onMouseEnter={pauseCarousel} onWheel={pauseCarousel} onTouchStart={pauseCarousel} onFocus={pauseCarousel} onKeyDown={pauseCarousel} className={`template-options creation-template-family family-${familyId}`}>
          <legend>{families.find(family => family.id === familyId)?.name} <small>· elegí una plantilla</small></legend>
         {[0, 1, 2].flatMap(copy => familyTemplates.map(template => (
           <label data-carousel-card key={`${copy}-${template.id}`} aria-hidden={copy !== 1}>
             <input disabled={copy !== 1} tabIndex={copy === 1 ? 0 : -1} type="radio" name="template" value={template.id} checked={copy === 1 && choice === template.id} onChange={() => setChoice(template.id)} />
             <TemplateThumbnail template={template} />
             <strong>{template.name} · {template.category}</strong><small>{template.description}</small>
              <Link tabIndex={copy === 1 ? 0 : -1} className="template-choice-preview" href={`/templates/${template.id}`}>Ver vista previa ↗</Link>
           </label>
         )))}
       </fieldset>
       <div className="creation-carousel-bullets" aria-label="Elegí una plantilla">
         {familyTemplates.map((template, index) => <button type="button" key={template.id} aria-label={`Ir a ${template.name}`} aria-current={activeTemplate === index} className={activeTemplate === index ? 'active' : ''} onClick={() => moveToTemplate(index)} />)}
       </div>
      <fieldset className="template-options">
         <legend>Empezar desde cero</legend>
        <label>
          <input type="radio" name="template" value="blank" checked={choice === 'blank'} onChange={() => setChoice('blank')} />
          <span className="template-art blank">Aa<b>+</b></span>
           <strong>Sitio en blanco</strong><small>Incluye una portada y una sección de contacto. Agregá el resto desde el editor.</small>
        </label>
      </fieldset>
      {state.error && <p role="alert" className="p-error">{state.error}</p>}
       <button className="p-button primary" disabled={pending}>{pending ? 'Creando tu sitio…' : 'Crear sitio y abrir editor ↗'}</button>
    </form>
  )
}
