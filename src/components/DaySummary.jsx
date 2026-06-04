import { formatMoney } from '../utils/format.js'
import { calcularResumen } from '../utils/resumen.js'

/**
 * Tarjetas con el resumen del día.
 * @param {Array} ventas Ventas del día a resumir.
 */
export default function DaySummary({ ventas }) {
  const r = calcularResumen(ventas)

  return (
    <section className="resumen" aria-label="Resumen del día">
      <div className="card resumen__card resumen__card--total">
        <span className="resumen__icono">💰</span>
        <span className="resumen__label">Total del día</span>
        <span className="resumen__valor">{formatMoney(r.total)}</span>
      </div>

      <div className="card resumen__card">
        <span className="resumen__icono">💵</span>
        <span className="resumen__label">Efectivo</span>
        <span className="resumen__valor">{formatMoney(r.efectivo)}</span>
        <span className="resumen__detalle">{r.efectivoCount} clientes</span>
      </div>

      <div className="card resumen__card">
        <span className="resumen__icono">📱</span>
        <span className="resumen__label">Mercado Pago</span>
        <span className="resumen__valor">{formatMoney(r.mercadoPago)}</span>
        <span className="resumen__detalle">{r.mercadoPagoCount} clientes</span>
      </div>

      <div className="card resumen__card">
        <span className="resumen__icono">⭐</span>
        <span className="resumen__label">Más vendido</span>
        <span className="resumen__valor resumen__valor--texto">
          {r.productoTop || '—'}
        </span>
        <span className="resumen__detalle">
          {r.productoTop ? `${r.productoTopUnidades} unidades` : 'Sin datos'}
        </span>
      </div>

      <div className="card resumen__card">
        <span className="resumen__icono">👥</span>
        <span className="resumen__label">Clientes del día</span>
        <span className="resumen__valor">{r.clientes}</span>
      </div>
    </section>
  )
}
