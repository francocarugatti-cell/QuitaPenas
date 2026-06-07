import { NEGOCIOS } from '../utils/negocios.js'

// Menú de navegación lateral (en desktop) / barra superior (en móvil).
const ITEMS = [
  { id: 'ventas', label: 'Ventas', icono: '🧾' },
  { id: 'productos', label: 'Productos', icono: '🥖' },
  { id: 'resumen', label: 'Resumen', icono: '📊' },
]

/**
 * @param {string} negocio      Negocio (canal) activo.
 * @param {Function} setNegocio Cambia el negocio activo (sale del resumen general).
 * @param {boolean} general     Si está activo el resumen general (los 3 negocios).
 * @param {Function} setGeneral Abre el resumen general.
 * @param {string} vista        Vista activa actual.
 * @param {Function} setVista   Cambia la vista activa.
 * @param {Function} onLogout   Cierra la sesión.
 */
export default function Sidebar({
  negocio,
  setNegocio,
  general,
  setGeneral,
  vista,
  setVista,
  onLogout,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__logo" aria-hidden="true">🥐</span>
        <span className="sidebar__nombre">Quita Penas</span>
      </div>

      {/* Selector de negocio: cada uno tiene sus propios productos y ventas. */}
      <nav className="sidebar__negocios" aria-label="Negocios">
        {NEGOCIOS.map((n) => (
          <button
            key={n.id}
            className={`sidebar__negocio ${!general && negocio === n.id ? 'is-active' : ''}`}
            onClick={() => setNegocio(n.id)}
            aria-current={!general && negocio === n.id ? 'true' : undefined}
          >
            <span className="sidebar__negocio-icono" aria-hidden="true">{n.icono}</span>
            <span className="sidebar__negocio-label">{n.label}</span>
          </button>
        ))}

        {/* Resumen general: junta los 3 negocios. */}
        <button
          className={`sidebar__negocio sidebar__negocio--general ${general ? 'is-active' : ''}`}
          onClick={() => setGeneral()}
          aria-current={general ? 'true' : undefined}
        >
          <span className="sidebar__negocio-icono" aria-hidden="true">📈</span>
          <span className="sidebar__negocio-label">Resumen general</span>
        </button>
      </nav>

      {/* El menú de secciones solo aplica dentro de un negocio. */}
      {!general && (
        <nav className="sidebar__nav" aria-label="Secciones">
          {ITEMS.map((item) => (
            <button
              key={item.id}
              className={`sidebar__item ${vista === item.id ? 'is-active' : ''}`}
              onClick={() => setVista(item.id)}
              aria-current={vista === item.id ? 'page' : undefined}
            >
              <span className="sidebar__item-icono" aria-hidden="true">{item.icono}</span>
              <span className="sidebar__item-label">{item.label}</span>
            </button>
          ))}
        </nav>
      )}

      <button className="sidebar__logout" onClick={onLogout}>
        <span aria-hidden="true">🚪</span>
        <span>Cerrar sesión</span>
      </button>
    </aside>
  )
}
