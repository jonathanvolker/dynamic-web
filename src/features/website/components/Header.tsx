'use client'

import { useState } from 'react'
import type { Settings } from '../types'
import { resolveHref } from '../links'
import { Brand } from './Brand'

export function Header({ settings, anchors }: { settings: Settings; anchors: string[] }) {
  const [open, setOpen] = useState(false)
  const button = settings.headerButton ?? { label: 'Hablemos', href: '#contact' }
  const buttonHref = resolveHref(button.href, anchors)
  return <header className="header wrap">
    <a className="logo" href="#main" aria-label={`${settings.brand}, inicio`}><Brand settings={settings} /></a>
    <button className="menu-toggle" aria-expanded={open} aria-controls="navigation" onClick={() => setOpen(!open)}>{open ? 'Cerrar −' : 'Menú +'}</button>
    <nav id="navigation" aria-label="Navegación principal" className={open ? 'navigation open' : 'navigation'}>
      {settings.navigation?.map((item, i) => { const href = resolveHref(item.href, anchors); return href && <a key={i} href={href} onClick={() => setOpen(false)}>{item.label}</a> })}
      {buttonHref && button.label && <a className="nav-contact" href={buttonHref} onClick={() => setOpen(false)}>{button.label} <span>↗</span></a>}
    </nav>
  </header>
}
