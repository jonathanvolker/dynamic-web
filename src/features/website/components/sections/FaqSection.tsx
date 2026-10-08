import type { SectionProps } from './types'

export function FaqSection({ section, anchor }: SectionProps) {
  return (
    <section id={anchor} className="section wrap faq">
       <div><p className="eyebrow" data-forma-field="eyebrow">{section.eyebrow}</p><h2 data-forma-field="title">{section.title}</h2></div>
      <div className="questions">
        {section.questions?.map((question, index) => (
          <details key={index}>
            <summary data-forma-field={`questions.${index}.question`}>{question.question}<span aria-hidden="true">+</span></summary><p data-forma-field={`questions.${index}.answer`}>{question.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
