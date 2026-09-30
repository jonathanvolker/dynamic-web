'use client'

import { useState } from 'react'
import type { Settings } from '../types'

export function Header({ settings }: { settings: Settings }) {
  const [open, setOpen] = useState(false)
  return <header className="header wrap">
    <a className="logo" href="#main" aria-label={`${settings.brand}, inicio`}>{settings.brand}<span className="logo-dot">✳</span></a>
    <button className="menu-toggle" aria-expanded={open} aria-controls="navigation" onClick={() => setOpen(!open)}>{open ? 'Cerrar −' : 'Menú +'}</button>
    <nav id="navigation" aria-label="Navegación principal" className={open ? 'navigation open' : 'navigation'}>
      {settings.navigation?.map((item, i) => <a key={i} href={item.href} onClick={() => setOpen(false)}>{item.label}</a>)}
      <a className="nav-contact" href="#contact" onClick={() => setOpen(false)}>Hablemos <span>↗</span></a>
    </nav>
  </header>
}
