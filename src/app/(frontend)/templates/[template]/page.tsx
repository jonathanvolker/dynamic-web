import { notFound } from 'next/navigation'
import { templates, getTemplate } from '@/features/templates/registry'
import { TemplatePreview } from '@/features/templates/components/TemplatePreview'

type Props = { params: Promise<{ template: string }> }
export const dynamicParams = false
export function generateStaticParams() { return templates.map(template => ({ template: template.id })) }
export async function generateMetadata({ params }: Props) {
  const template = getTemplate((await params).template)
  return { title: `${template?.name || 'Plantilla'} — Vista previa | Forma`, description: template?.description }
}
export default async function Preview({ params }: Props) {
  const template = getTemplate((await params).template)
  if (!template) notFound()
  return <TemplatePreview template={template} />
}
