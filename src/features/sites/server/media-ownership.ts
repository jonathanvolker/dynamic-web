import { mediaId } from '@/features/website/media'
import type { SiteDocument } from '../types'

export function mediaIdsInDocument(document: SiteDocument) {
  const images = [document.settings.logo, ...document.sections.flatMap(section => [
    section.image,
    ...(section.projects || []).map(project => project.image),
    ...(section.gallery || []).map(item => item.image),
    ...(section.logos || []).map(logo => logo.image),
    ...(section.team || []).map(member => member.image),
  ])]
  return new Set(images.flatMap(image => image?.url && mediaId(image.url) ? [mediaId(image.url)!] : []))
}
