'use client'

import { useEffect, useRef, useState } from 'react'
import type { SectionProps } from './types'
import { SectionHeading } from './SectionHeading'

export function GallerySection({ section, anchor, preview }: SectionProps) {
  const items = section.gallery ?? []
  const trackRef = useRef<HTMLDivElement>(null)
  const activeIndexRef = useRef(0)
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pauseRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)

  const scrollToItem = (index: number) => {
    const nextIndex = items.length ? (index + items.length) % items.length : 0
    const item = trackRef.current?.children[nextIndex] as HTMLElement | undefined
    if (!preview) item?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'start' })
    activeIndexRef.current = nextIndex
    setActiveIndex(nextIndex)
  }

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotionPreference = () => setReducedMotion(media.matches)
    updateMotionPreference()
    media.addEventListener('change', updateMotionPreference)
    return () => media.removeEventListener('change', updateMotionPreference)
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const onScroll = () => {
      const children = Array.from(track.children) as HTMLElement[]
      if (!children.length) return
      const index = children.reduce((closest, child, i) => {
        const distance = Math.abs(child.offsetLeft - track.scrollLeft)
        const closestDistance = Math.abs(children[closest]?.offsetLeft - track.scrollLeft)
        return distance < closestDistance ? i : closest
      }, 0)
      activeIndexRef.current = index
      setActiveIndex(index)
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    return () => track.removeEventListener('scroll', onScroll)
  }, [items.length])

  useEffect(() => {
    if (preview || items.length < 2 || reducedMotion) return
    autoplayRef.current = setInterval(() => {
      scrollToItem(activeIndexRef.current + 1)
    }, 5000)
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current)
      if (pauseRef.current) clearTimeout(pauseRef.current)
    }
  }, [items.length, reducedMotion, preview])

  const pauseAfterInteraction = () => {
    if (preview || reducedMotion || items.length < 2) return
    if (autoplayRef.current) clearInterval(autoplayRef.current)
    if (pauseRef.current) clearTimeout(pauseRef.current)
    pauseRef.current = setTimeout(() => {
      autoplayRef.current = setInterval(() => {
        scrollToItem(activeIndexRef.current + 1)
      }, 5000)
    }, 3000)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    pauseAfterInteraction()
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      scrollToItem(activeIndex + 1)
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      scrollToItem(activeIndex - 1)
    }
    if (event.key === 'Home') {
      event.preventDefault()
      scrollToItem(0)
    }
    if (event.key === 'End') {
      event.preventDefault()
      scrollToItem(items.length - 1)
    }
  }

  const movePrevious = () => { pauseAfterInteraction(); scrollToItem(activeIndex - 1) }
  const moveNext = () => { pauseAfterInteraction(); scrollToItem(activeIndex + 1) }

  return <section id={anchor} className="section wrap gallery">
    <SectionHeading section={section} />
    <div className="gallery-carousel" role="region" aria-roledescription="carrusel" aria-label={section.title || 'Galería'} onMouseEnter={pauseAfterInteraction} onFocus={pauseAfterInteraction} onPointerDown={pauseAfterInteraction} onTouchStart={pauseAfterInteraction} onWheel={pauseAfterInteraction}>
      <div className="gallery-controls" aria-label="Controles de galería">
        <button type="button" aria-label="Imagen anterior" onClick={movePrevious} disabled={!items.length}>←</button>
        <span aria-live="polite">Imagen {items.length ? activeIndex + 1 : 0} de {items.length}</span>
        <button type="button" aria-label="Imagen siguiente" onClick={moveNext} disabled={!items.length}>→</button>
      </div>
      <div className="gallery-grid" ref={trackRef} tabIndex={0} onKeyDown={onKeyDown} aria-label="Galería deslizable">
        {items.map((item, index) => <figure className="gallery-item" key={index} role="group" aria-roledescription="diapositiva" aria-label={`${index + 1} de ${items.length}`} data-forma-field={`gallery.${index}`}>
         {item.image?.url
           ? <img src={item.image.url} alt={item.image.alt || item.title} loading="lazy" data-forma-field={`gallery.${index}.image`} />
           : <div className="gallery-placeholder" role="img" aria-label="Imagen pendiente"><span>▨</span><span>Tu imagen, tu historia</span></div>}
          <figcaption><h3 data-forma-field={`gallery.${index}.title`}>{item.title}</h3><p data-forma-field={`gallery.${index}.description`}>{item.description}</p></figcaption>
      </figure>)}
      </div>
       {items.length > 1 && <div className="gallery-dots" role="group" aria-label="Seleccionar imagen">
        {items.map((item, index) => <button key={index} type="button" className={index === activeIndex ? 'active' : ''} onClick={() => { pauseAfterInteraction(); scrollToItem(index) }} aria-label={`Ir a imagen ${index + 1}`} aria-current={index === activeIndex ? 'true' : undefined} />)}
      </div>}
    </div>
  </section>
}
