// Menú de navegación lateral (en desktop) / barra superior (en móvil).
const ITEMS = [
  { id: 'ventas', label: 'Ventas', icono: '🧾' },
  { id: 'productos', label: 'Productos', icono: '🥖' },
  { id: 'resumen', label: 'Resumen', icono: '📊' },
]

/**
 * @param {string} vista     Vista activa actual.
 * @param {Function} setVista Cambia la vista activa.
 * @param {Function} onLogout Cierra la sesión.
 */
export default function Sidebar({ vista, setVista, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__logo" aria-hidden="true">🥐</span>
        <span className="sidebar__nombre">Quita Penas</span>
      </div>

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

      <button className="sidebar__logout" onClick={onLogout}>
        <span aria-hidden="true">🚪</span>
        <span>Cerrar sesión</span>
      </button>
    </aside>
  )
}
