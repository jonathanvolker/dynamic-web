'use client'

import { useEffect, useRef, useState } from 'react'
import type { SectionProps } from './types'
import { SectionHeading } from './SectionHeading'

export function GallerySection({ section, anchor }: SectionProps) {
  const items = section.gallery ?? []
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const scrollToItem = (index: number) => {
    const item = trackRef.current?.children[index] as HTMLElement | undefined
    item?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
    setActiveIndex(index)
  }

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const onScroll = () => {
      const children = Array.from(track.children) as HTMLElement[]
      const index = children.reduce((closest, child, i) => {
        const distance = Math.abs(child.offsetLeft - track.scrollLeft)
        const closestDistance = Math.abs(children[closest]?.offsetLeft - track.scrollLeft)
        return distance < closestDistance ? i : closest
      }, 0)
      setActiveIndex(index)
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    return () => track.removeEventListener('scroll', onScroll)
  }, [items.length])

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      scrollToItem(Math.min(activeIndex + 1, items.length - 1))
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      scrollToItem(Math.max(activeIndex - 1, 0))
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

  return <section id={anchor} className="section wrap gallery">
    <SectionHeading section={section} />
    <div className="gallery-carousel" role="region" aria-label={section.title || 'Galería'}>
      {items.length > 1 && <div className="gallery-controls">
        <button className="gallery-control" type="button" onClick={() => scrollToItem(Math.max(activeIndex - 1, 0))} disabled={activeIndex === 0} aria-label="Imagen anterior">←</button>
        <button className="gallery-control" type="button" onClick={() => scrollToItem(Math.min(activeIndex + 1, items.length - 1))} disabled={activeIndex === items.length - 1} aria-label="Imagen siguiente">→</button>
      </div>}
      <div className="gallery-grid" ref={trackRef} tabIndex={0} onKeyDown={onKeyDown} aria-label="Galería deslizable">
      {items.map((item, index) => <figure className="gallery-item" key={index}>
        {item.image?.url
          ? <img src={item.image.url} alt={item.image.alt || item.title} loading="lazy" />
          : <div className="gallery-placeholder" role="img" aria-label="Imagen pendiente"><span>▨</span><span>Tu imagen, tu historia</span></div>}
        <figcaption><h3>{item.title}</h3><p>{item.description}</p></figcaption>
      </figure>)}
      </div>
      {items.length > 1 && <div className="gallery-dots" aria-label="Seleccionar imagen">
        {items.map((item, index) => <button key={index} type="button" className={index === activeIndex ? 'active' : ''} onClick={() => scrollToItem(index)} aria-label={`Ir a imagen ${index + 1}`} aria-current={index === activeIndex ? 'true' : undefined} />)}
      </div>}
    </div>
  </section>
}
