import { formatMoney, formatHora } from '../utils/format.js'
import { agruparPorCliente } from '../utils/resumen.js'

/**
 * Tabla de ventas agrupadas por cliente (ticket). Cada cliente muestra sus
 * productos juntos, con su hora, método de pago y total.
 * @param {Array} ventas       Ventas a mostrar.
 * @param {Function} onEliminar Recibe el grupo del cliente a eliminar (o null si no se permite).
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

  // Clientes ordenados con los más recientes arriba (manteniendo su número de orden).
  const clientes = agruparPorCliente(ventas).sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha),
  )

  return (
    <div className="clientes">
      {clientes.map((cliente) => (
        <div key={cliente.clave} className="card cliente">
          <div className="cliente__cabecera">
            <div className="cliente__id">
              <span className="cliente__avatar">🧑</span>
              <div>
                <span className="cliente__nombre">Cliente {cliente.numero}</span>
                <span className="cliente__hora">{formatHora(cliente.fecha)}</span>
              </div>
            </div>

            <div className="cliente__meta">
              <span
                className={`badge ${
                  cliente.metodo === 'Efectivo'
                    ? 'badge--efectivo'
                    : cliente.metodo === 'Mercado Pago'
                      ? 'badge--mp'
                      : 'badge--mixto'
                }`}
              >
                {cliente.metodo === 'Efectivo' ? '💵' : cliente.metodo === 'Mercado Pago' ? '📱' : '🔀'}{' '}
                {cliente.metodo}
              </span>
              <span className="cliente__total">{formatMoney(cliente.total)}</span>
              {onEliminar && (
                <button
                  className="btn btn--icono btn--peligro"
                  onClick={() => onEliminar(cliente)}
                  aria-label={`Eliminar cliente ${cliente.numero}`}
                  title="Eliminar cliente"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>

          <ul className="cliente__items">
            {cliente.items.map((v) => (
              <li key={v.id} className="cliente__item">
                <span className="cliente__item-nombre">{v.producto}</span>
                <span className="cliente__item-cant">{v.cantidad} × {formatMoney(v.precio)}</span>
                <span className="cliente__item-total">{formatMoney(v.total)}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
