import type { SectionProps } from './types'
import { SectionHeading } from './SectionHeading'

export function GallerySection({ section, anchor }: SectionProps) {
  return <section id={anchor} className="section wrap gallery">
    <SectionHeading section={section} />
    <div className="gallery-grid">
      {section.gallery?.map((item, index) => <figure className="gallery-item" key={index}>
        {item.image?.url
          ? <img src={item.image.url} alt={item.image.alt || item.title} loading="lazy" />
          : <div className="gallery-placeholder" role="img" aria-label="Imagen pendiente"><span>▨</span><span>Tu imagen, tu historia</span></div>}
        <figcaption><h3>{item.title}</h3><p>{item.description}</p></figcaption>
      </figure>)}
    </div>
  </section>
}
