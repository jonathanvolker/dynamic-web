'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { currentUser, requireUser } from '@/features/auth/server/session'
import { createSite, findSite, saveDocument, removePublication, deleteSite } from './server/repository'
import { validateSite } from './validation'
import { getTemplate } from '@/features/templates/registry'
import { assertMediaOwnership } from './server/media'
export async function newSite(_state: { error: string }, form: FormData): Promise<{ error: string }> {
  const user = await requireUser()
  const name = String(form.get('name') || '').trim()
  if (!name || name.length > 80) return { error: 'Elegí un nombre de hasta 80 caracteres.' }
  const template = String(form.get('template') || 'studio')
  if (template !== 'blank' && !getTemplate(template)) return { error: 'Elegí una plantilla disponible.' }
  const id = createSite(user.id, name, template)
  redirect(`/editor/${id}`)
}
export async function saveSite(id: string, input: unknown, publish: boolean) {
  const user = await currentUser()
  if (!user) return { error: 'Tu sesión venció. Iniciá sesión para continuar.' }
  const site = findSite(id, user.id)
  if (!site) return { error: 'No tenés acceso a este sitio.' }
  try {
    validateSite(input)
    assertMediaOwnership(input, user.id)
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
