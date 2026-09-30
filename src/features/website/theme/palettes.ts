import type { Settings, SiteColors } from '../types'

export const defaultColors: SiteColors = {
  background: '#f8f7f2', text: '#272923', muted: '#6d7065',
  surface: '#eeeee6', border: '#ddded5',
  projectPeach: '#edb593', projectPurple: '#b8a6dc', projectLime: '#dce599',
}

export const colorLabels: Record<keyof SiteColors, string> = {
  background: 'Fondo de la web', text: 'Texto principal', muted: 'Texto secundario',
  surface: 'Fondo de secciones destacadas', border: 'Líneas y separadores',
  projectPeach: 'Proyectos · estilo 1', projectPurple: 'Proyectos · estilo 2', projectLime: 'Proyectos · estilo 3',
}

type Palette = { id: string; name: string; accent: string; colors: SiteColors }

export const palettes: Palette[] = [
  { id: 'forma', name: 'Lima editorial', accent: '#d6f76b', colors: defaultColors },
  {
    id: 'ocean', name: 'Océano', accent: '#2879cc',
    colors: {
      background: '#f2f7fc', text: '#172c45', muted: '#546b83',
      surface: '#e3edf7', border: '#cad9e8',
      projectPeach: '#9bcde3', projectPurple: '#aebfe5', projectLime: '#a8d8ca',
    },
  },
  {
    id: 'terracotta', name: 'Tierra cálida', accent: '#b94f36',
    colors: {
      background: '#fcf6ef', text: '#402b23', muted: '#7d6255',
      surface: '#f0e3d5', border: '#e2cdbb',
      projectPeach: '#e0a383', projectPurple: '#bdadb7', projectLime: '#c6ca9f',
    },
  },
  {
    id: 'night', name: 'Noche violeta', accent: '#c7afff',
    colors: {
      background: '#18171f', text: '#f3effa', muted: '#b2abbe',
      surface: '#25232e', border: '#403b4b',
      projectPeach: '#906b88', projectPurple: '#645887', projectLime: '#526e65',
    },
  },
]

/** Missing color values keep older saved documents renderable. */
export function resolveColors(settings: Settings): SiteColors {
  return { ...defaultColors, ...settings.colors }
}

/** Choose the most legible foreground for accent/project backgrounds. */
export function foregroundFor(background: string): string {
  const channels = background.slice(1).match(/.{2}/g)!.map(value => {
    const channel = parseInt(value, 16) / 255
    return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4
  })
  const luminance = channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722
  return luminance > .179 ? '#171b17' : '#ffffff'
}
