import type { Section } from '../../types'

export function SectionHeading({ section }: { section: Section }) {
  return (
    <div className="section-heading">
      <div><p className="eyebrow">{section.eyebrow}</p><h2>{section.title}</h2></div>
      <p className="section-description">{section.description}</p>
    </div>
  )
}
