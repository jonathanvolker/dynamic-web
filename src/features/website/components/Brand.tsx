import type { Settings } from '../types'

export function Brand({ settings }: { settings: Settings }) {
  return settings.logo?.url
    ? <img className="brand-image" src={settings.logo.url} alt={settings.logo.alt || settings.brand} />
    : <>{settings.brand}<span className="logo-dot">✳</span></>
}
