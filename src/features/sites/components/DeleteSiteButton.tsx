'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { removeSite } from '../actions'
import { Modal } from '@/features/platform/components/Modal'

export function DeleteSiteButton({ siteId, siteName }: { siteId: string; siteName: string }) {
  const [open, setOpen] = useState(false)
  const [busy, startTransition] = useTransition()
  const router = useRouter()
  function remove() {
    startTransition(async () => {
      await removeSite(siteId)
      setOpen(false)
      router.refresh()
    })
  }
  return <>
    <button className="delete-site" type="button" onClick={() => setOpen(true)}>Eliminar sitio</button>
    <Modal open={open} title={`¿Eliminar “${siteName}”?`} description="Se eliminará el borrador, la publicación y su dirección local. Esta acción no se puede deshacer." confirmLabel="Eliminar sitio" tone="danger" busy={busy} onConfirm={remove} onCancel={() => setOpen(false)} />
  </>
}
