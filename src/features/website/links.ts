import type { Section } from './types'

export function sectionAnchors(sections: Section[]) {
  const counts: Record<string, number> = {}
  return sections.map(section => {
    const count = (counts[section.blockType] || 0) + 1
    counts[section.blockType] = count
    return section.anchor || `${section.blockType}${count > 1 ? `-${count}` : ''}`
  })
}

export function isSafeHref(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 500 || /[\s\\\u0000-\u001f]/.test(value)) return false
  if (/^#[\w-]+$/.test(value) || /^\/(?!\/)/.test(value)) return true
  if (/^mailto:[^@?]+@[^@?]+\.[^@?]+$/.test(value) || /^tel:\+?[\d()-]+$/.test(value)) return true
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password
  } catch { return false }
}

/** A removed section must not leave an active dead CTA on the published site. */
export function resolveHref(href: string, anchors: string[]): string | undefined {
  if (!isSafeHref(href)) return undefined
  if (href.startsWith('#') && href !== '#main' && !anchors.includes(href.slice(1))) return undefined
  return href
}
