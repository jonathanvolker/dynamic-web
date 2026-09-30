import type { SectionProps } from './types'

export function FaqSection({ section, anchor }: SectionProps) {
  return (
    <section id={anchor} className="section wrap faq">
      <div><p className="eyebrow">{section.eyebrow}</p><h2>{section.title}</h2></div>
      <div className="questions">
        {section.questions?.map((question, index) => (
          <details key={index}>
            <summary>{question.question}<span aria-hidden="true">+</span></summary><p>{question.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
