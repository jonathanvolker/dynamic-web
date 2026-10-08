import type { Section } from '../../types'

export function SectionHeading({ section }: { section: Section }) {
  return (
    <div className="section-heading">
      <div><p className="eyebrow" data-forma-field="eyebrow">{section.eyebrow}</p><h2 data-forma-field="title">{section.title}</h2></div>
      <p className="section-description" data-forma-field="description">{section.description}</p>
    </div>
  )
}
