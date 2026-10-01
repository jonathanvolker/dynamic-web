import type { Settings } from '../../types'

/** Decorative product preview; a client can replace it with their own screenshot. */
export function ProductArtwork({ settings }: { settings: Settings }) {
  return <div className="product-artwork" role="img" aria-label="Vista ilustrativa de un tablero de proyectos">
    <div className="product-window-bar"><span>● ● ●</span><span>Un espacio compartido</span><span>↗</span></div>
    <div className="product-window-body">
      <div className="product-rail"><strong>{settings.brand}<span>▰</span></strong><span className="selected">▦ Vista general</span><span>◷ Mi semana</span><span>◉ Equipo</span><div className="product-profile">Tu espacio de trabajo</div></div>
      <div className="product-board"><div className="product-board-heading"><div><span>ASÍ SE VE UN BUEN COMIENZO</span><strong>Todo, en perspectiva.</strong></div><span className="product-add">+ Nuevo proyecto</span></div>
        <div className="product-metrics"><div><small>En marcha</small><strong>12 <span>↗</span></strong></div><div><small>Esta semana</small><strong>08 <span>✓</span></strong></div><div><small>En equipo</small><strong>24 <span>◉</span></strong></div></div>
        <div className="product-columns">{['Por empezar', 'En movimiento', 'Listo para compartir'].map((title, index) => <div className="product-column" key={title}><span>{title}<b>{index + 2}</b></span><div className="product-task"><i /><strong>{['La próxima gran idea', 'Construir en equipo', 'Una nueva perspectiva'][index]}</strong><p>Un paso a la vez.</p><div><span>● ●</span><span>↗</span></div></div><div className="product-task skeleton"><i /><span /><span /></div></div>)}</div>
      </div>
    </div>
  </div>
}
