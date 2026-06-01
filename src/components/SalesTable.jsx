import { formatMoney, formatHora } from '../utils/format.js'

/**
 * Tabla de ventas con opción de eliminar.
 * @param {Array} ventas       Ventas a mostrar.
 * @param {Function} onEliminar Recibe el id de la venta a eliminar (puede ser null si no se permite).
 */
export default function SalesTable({ ventas, onEliminar }) {
  if (ventas.length === 0) {
    return (
      <div className="card tabla__vacio">
        <span className="tabla__vacio-icono">🧺</span>
        <p>Sin ventas registradas</p>
      </div>
    )
  }

  // Orden por hora descendente (más recientes arriba).
  const ordenadas = [...ventas].sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha),
  )

  return (
    <div className="card tabla__contenedor">
      <table className="tabla">
        <thead>
          <tr>
            <th>Hora</th>
            <th>Producto</th>
            <th className="tabla__num">Cant.</th>
            <th className="tabla__num">Precio</th>
            <th className="tabla__num">Total</th>
            <th>Pago</th>
            {onEliminar && <th aria-label="Acciones"></th>}
          </tr>
        </thead>
        <tbody>
          {ordenadas.map((v) => (
            <tr key={v.id} className="tabla__fila">
              <td>{formatHora(v.fecha)}</td>
              <td>{v.producto}</td>
              <td className="tabla__num">{v.cantidad}</td>
              <td className="tabla__num">{formatMoney(v.precio)}</td>
              <td className="tabla__num tabla__total">{formatMoney(v.total)}</td>
              <td>
                <span className={`badge ${v.metodo === 'Efectivo' ? 'badge--efectivo' : 'badge--mp'}`}>
                  {v.metodo === 'Efectivo' ? '💵' : '📱'} {v.metodo}
                </span>
              </td>
              {onEliminar && (
                <td>
                  <button
                    className="btn btn--icono btn--peligro"
                    onClick={() => onEliminar(v.id)}
                    aria-label={`Eliminar venta de ${v.producto}`}
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
