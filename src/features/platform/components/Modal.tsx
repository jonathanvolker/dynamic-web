'use client'

import { useEffect, useId, useRef } from 'react'

type Props = {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  tone?: 'neutral' | 'danger'
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function Modal({ open, title, description, confirmLabel, cancelLabel = 'Cancelar', tone = 'neutral', busy = false, onConfirm, onCancel }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const confirm = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) element.showModal()
    if (!open && element.open) element.close()
  }, [open])

  useEffect(() => {
    if (open) window.setTimeout(() => confirm.current?.focus(), 0)
  }, [open])

  return <dialog
    ref={dialog}
    className={`forma-modal ${tone === 'danger' ? 'forma-modal-danger' : ''}`}
    aria-labelledby={titleId}
    aria-describedby={descriptionId}
    onCancel={event => { event.preventDefault(); if (!busy) onCancel() }}
    onClick={event => { if (event.target === event.currentTarget && !busy) onCancel() }}
  >
    <div className="forma-modal-mark" aria-hidden="true">{tone === 'danger' ? '!' : '✳'}</div>
    <div className="forma-modal-copy">
      <p className="p-kicker">{tone === 'danger' ? 'ACCIÓN IRREVERSIBLE' : 'CONFIRMAR ACCIÓN'}</p>
      <h2 id={titleId}>{title}</h2>
      <p id={descriptionId}>{description}</p>
    </div>
    <div className="forma-modal-actions">
      <button type="button" className="forma-modal-cancel" onClick={onCancel} disabled={busy}>{cancelLabel}</button>
      <button ref={confirm} type="button" className={`forma-modal-confirm ${tone === 'danger' ? 'danger' : ''}`} onClick={onConfirm} disabled={busy}>
        {busy ? 'Procesando…' : confirmLabel}
      </button>
    </div>
  </dialog>
}
