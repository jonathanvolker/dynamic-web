'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { currentUser, requireUser } from '@/features/auth/server/session'
import { createSite, findSite, listSites, saveDocument, removePublication, deleteSite } from './server/repository'
import { validateSite } from './validation'
import { getTemplate } from '@/features/templates/registry'
import { assertMediaOwnership } from './server/media'
import { mediaIdsInDocument } from './server/media-ownership'
import { assertCanCreateSite, assertCanEdit, assertCanPublish, canUseBlock } from '@/features/billing/server/access'
export async function newSite(_state: { error: string }, form: FormData): Promise<{ error: string }> {
  const user = await requireUser()
  const name = String(form.get('name') || '').trim()
  if (!name || name.length > 80) return { error: 'Elegí un nombre de hasta 80 caracteres.' }
  const template = String(form.get('template') || 'studio')
  if (template !== 'blank' && !getTemplate(template)) return { error: 'Elegí una plantilla disponible.' }
  let id: string
  try {
    const entitlements = assertCanCreateSite(user.id)
    const sites = listSites(user.id)
    if (sites.length >= entitlements.plan.maxSites) return { error: `Tu plan ${entitlements.plan.name} permite hasta ${entitlements.plan.maxSites} sitio${entitlements.plan.maxSites === 1 ? '' : 's'}.` }
    id = createSite(user.id, name, template, entitlements.plan.allowedBlocks)
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'No pudimos crear el sitio.' }
  }
  redirect(`/editor/${id}`)
}
export async function saveSite(id: string, input: unknown, publish: boolean) {
  const user = await currentUser()
  if (!user) return { error: 'Tu sesión venció. Iniciá sesión para continuar.' }
  const site = findSite(id, user.id)
  if (!site) return { error: 'No tenés acceso a este sitio.' }
  try {
    const entitlements = assertCanEdit(user.id)
    validateSite(input)
    assertMediaOwnership(input, user.id)
    const document = input as { sections: { id?: string; blockType: string }[] }
    const mediaCount = mediaIdsInDocument(input as never).size
    if (mediaCount > entitlements.plan.maxMediaPerSite) throw new Error(`Tu plan permite hasta ${entitlements.plan.maxMediaPerSite} imágenes por sitio.`)
    const existing = new Set(site.draft.sections.map(section => `${section.id}:${section.blockType}`))
    const invalid = document.sections.find(section => section.blockType !== 'footer' && !canUseBlock(entitlements, section.blockType) && !existing.has(`${section.id}:${section.blockType}`))
    if (invalid) throw new Error(`El bloque ${invalid.blockType} requiere un plan superior.`)
    const changedLocked = document.sections.find(section => {
      if (section.blockType === 'footer' || canUseBlock(entitlements, section.blockType)) return false
      const original = site.draft.sections.find(item => item.id === section.id && item.blockType === section.blockType)
      return original && JSON.stringify(original) !== JSON.stringify(section)
    })
    if (changedLocked) throw new Error('Las secciones conservadas de un plan anterior no se pueden editar.')
    if (publish) assertCanPublish(user.id)
  } catch (error) { return { error: error instanceof Error ? error.message : 'Datos no válidos.' } }
  const now = saveDocument(id, user.id, input, publish)
  revalidatePath(`/s/${site.slug}`)
  revalidatePath('/dashboard')
  return { success: true, publishedAt: publish ? now : site.published_at }
}
export async function unpublishSite(id: string) {
  const user = await requireUser()
  const site = findSite(id, user.id)
  if (!site) return
  removePublication(id, user.id)
  revalidatePath(`/s/${site.slug}`); revalidatePath('/dashboard')
}

export async function removeSite(id: string) {
  const user = await requireUser()
  deleteSite(id, user.id)
  revalidatePath('/dashboard')
}
