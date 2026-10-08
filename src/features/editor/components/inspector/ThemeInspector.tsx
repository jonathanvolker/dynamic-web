import type { SiteColors } from '@/features/website/types'
import { palettes, resolveColors, colorLabels } from '@/features/website/theme/palettes'
import type { EditorController } from '../../hooks/use-site-editor'
import { ColorField } from '../fields/ColorField'

export function ThemeInspector({ editor }: { editor: EditorController }) {
  const { settings } = editor.document
  const colors = resolveColors(settings)
  const selected = palettes.find(palette => palette.accent === settings.accent
    && Object.keys(palette.colors).every(key => palette.colors[key as keyof SiteColors] === colors[key as keyof SiteColors]))

  return (
    <div className="theme-inspector">
      <div className="inspector-heading"><strong>Colores de tu web</strong></div>
      <p className="inspector-note">Elegí una paleta como base o usá los colores de tu marca. Los cambios se ven en vivo.</p>
      <div className="theme-presets" role="group" aria-label="Paletas prediseñadas">
        {palettes.map(palette => (
          <button
            type="button"
            key={palette.id}
            className="theme-preset"
            aria-pressed={selected?.id === palette.id}
            onClick={() => editor.change(next => {
              next.settings.accent = palette.accent
              next.settings.colors = { ...palette.colors }
            })}
          >
            <span className="theme-swatches" aria-hidden="true">
              {[palette.colors.background, palette.colors.text, palette.accent, palette.colors.projectPurple].map((color, index) => <i key={index} style={{ background: color }} />)}
            </span>
            <span>{palette.name}</span>
          </button>
        ))}
      </div>
      <ColorField label="Color de acento" value={settings.accent} onChange={value => editor.changeSetting('accent', value)} />
      {(Object.keys(colorLabels) as (keyof SiteColors)[]).map(key => (
        <ColorField
          key={key}
          label={colorLabels[key]}
          value={colors[key]}
          onChange={value => editor.changeSetting('colors', { ...colors, [key]: value })}
        />
      ))}
    </div>
  )
}
