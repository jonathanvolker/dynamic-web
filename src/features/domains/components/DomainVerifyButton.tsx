'use client'

import { useState } from 'react'

export function DomainVerifyButton({ id }: { id: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'error' | 'verified'>('idle')
  async function verify() {
    setState('loading')
    const response = await fetch(`/api/domains/${id}/verify`, { method: 'POST' })
    setState(response.ok ? 'verified' : 'error')
    if (response.ok) window.location.reload()
  }
  return <button className="domain-verify" onClick={verify} disabled={state === 'loading'}>{state === 'loading' ? 'Verificando…' : state === 'error' ? 'Intentar de nuevo' : 'Verificar DNS ↗'}</button>
}
