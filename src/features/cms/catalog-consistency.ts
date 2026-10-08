import { blockDefinitions, blockTypes, rowFields } from '@/features/website/blocks'
import { payloadBlocks } from './blocks'

type NamedField = { name?: unknown; type?: unknown; fields?: unknown }

const names = (fields: unknown) => Array.isArray(fields)
  ? fields.flatMap(field => {
      const named = field as NamedField
      return typeof named.name === 'string' ? [named.name] : []
    })
  : []

/** Checks the contract shared by the editor catalog and the Payload CMS schema. */
export function assertCmsCatalogConsistency() {
  const cmsSlugs: string[] = payloadBlocks.map(block => block.slug)
  const editorSlugs: string[] = [...blockTypes]
  const duplicateSlugs = cmsSlugs.filter((slug, index) => cmsSlugs.indexOf(slug) !== index)
  const missingInCms = editorSlugs.filter(slug => !cmsSlugs.includes(slug))
  const missingInEditor = cmsSlugs.filter(slug => !editorSlugs.includes(slug))
  const errors: string[] = []

  if (duplicateSlugs.length) errors.push(`Payload tiene slugs duplicados: ${[...new Set(duplicateSlugs)].join(', ')}`)
  if (missingInCms.length) errors.push(`Faltan en Payload: ${missingInCms.join(', ')}`)
  if (missingInEditor.length) errors.push(`Faltan en el catálogo del editor: ${missingInEditor.join(', ')}`)

  for (const type of blockTypes) {
    const definition = blockDefinitions[type]
    if (!definition.rows) continue
    const block = payloadBlocks.find(candidate => candidate.slug === type)
    const rowField = (block?.fields as unknown as NamedField[] | undefined)?.find(field => field.name === definition.rows)
    const configuredNames = names(rowField?.fields)
    const missingFields = rowFields[definition.rows]
      .map(field => field.name)
      .filter(name => !configuredNames.includes(name))
    if (missingFields.length) errors.push(`${type}.${definition.rows} no declara: ${missingFields.join(', ')}`)
  }

  if (errors.length) throw new Error(`Inconsistencia del catálogo CMS:\n- ${errors.join('\n- ')}`)
}
