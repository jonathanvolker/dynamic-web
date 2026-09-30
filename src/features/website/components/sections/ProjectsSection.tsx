import type { SectionProps } from './types'
import { SectionHeading } from './SectionHeading'
import { ProjectCard } from '../ProjectCard'

export function ProjectsSection({ section, anchor }: SectionProps) {
  return (
    <section id={anchor} className="section wrap projects">
      <SectionHeading section={section} />
      <div className="project-grid">
        {section.projects?.map((project, index) => <ProjectCard key={index} project={project} index={index} />)}
      </div>
    </section>
  )
}
