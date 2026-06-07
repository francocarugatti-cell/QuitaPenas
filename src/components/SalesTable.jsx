import { formatMoney, formatHora } from '../utils/format.js'
import { agruparPorCliente } from '../utils/resumen.js'

/**
 * Lista de ventas agrupadas por cliente. Cada bloque es un cliente (ticket)
 * con todos los productos que llevó.
 * @param {Array} ventas        Ventas a mostrar.
 * @param {Function} onEliminar Recibe los ids de los productos del cliente a eliminar (o null).
 */
export default function SalesTable({ ventas, onEliminar }) {
  if (ventas.length === 0) {
    return (
      <div className="card tabla__vacio">
        <span className="tabla__vacio-icono">🧺</span>
        <p>Sin clientes registrados</p>
      </div>
    )
  }

  // Más recientes arriba.
  const clientes = agruparPorCliente(ventas).reverse()

  return (
    <div className="clientes">
      {clientes.map((c) => (
        <article key={c.ticket} className="card cliente">
          <header className="cliente__cabecera">
            <div className="cliente__titulo">
              <span className="cliente__num">
                {c.nombre ? `👤 ${c.nombre}` : `Cliente #${c.numero}`}
              </span>
              <span className="cliente__hora">🕒 {formatHora(c.fecha)}</span>
            </div>
            <div className="cliente__acciones">
              <span className={`badge ${c.metodo === 'Efectivo' ? 'badge--efectivo' : 'badge--mp'}`}>
                {c.metodo === 'Efectivo' ? '💵' : '📱'} {c.metodo}
              </span>
              {onEliminar && (
                <button
                  className="btn btn--icono btn--peligro"
                  onClick={() => onEliminar(c.ids)}
                  aria-label={`Eliminar cliente #${c.numero}`}
                  title="Eliminar cliente"
                >
                  🗑️
                </button>
              )}
            </div>
          </header>

          <ul className="cliente__items">
            {c.items.map((v) => (
              <li key={v.id} className="cliente__item">
                <span className="cliente__cant">{v.cantidad}×</span>
                <span className="cliente__producto">{v.producto}</span>
                <span className="cliente__precio">{formatMoney(v.precio)} c/u</span>
                <span className="cliente__subtotal">{formatMoney(v.total)}</span>
              </li>
            ))}
          </ul>

          <footer className="cliente__pie">
            <span className="cliente__pie-label">Total del cliente</span>
            <span className="cliente__pie-total">{formatMoney(c.total)}</span>
          </footer>
        </article>
      ))}
    </div>
  )
}
