import { useState } from 'react'
import { NEGOCIOS, NEGOCIO_DEFECTO } from '../utils/negocios.js'
import {
  todayKey,
  dateKey,
  formatFechaLarga,
  formatMoney,
} from '../utils/format.js'
import { calcularResumen } from '../utils/resumen.js'

/**
 * Resumen general: junta las ventas de los 3 negocios en una sola página.
 * Permite elegir un día puntual o un rango de fechas.
 * No modifica los resúmenes individuales de cada negocio.
 * @param {Array} ventas Todas las ventas (de todos los canales).
 */
export default function GeneralSummary({ ventas }) {
  const hoy = todayKey()
  const [modo, setModo] = useState('dia') // 'dia' | 'rango'
  const [dia, setDia] = useState(hoy)
  const [desde, setDesde] = useState(hoy)
  const [hasta, setHasta] = useState(hoy)

  // Rango efectivo (ordenado, por si eligen "desde" mayor que "hasta").
  const ini = modo === 'dia' ? dia : (desde <= hasta ? desde : hasta)
  const fin = modo === 'dia' ? dia : (desde <= hasta ? hasta : desde)

  // ¿La venta entra en el período elegido?
  function enPeriodo(v) {
    const k = dateKey(v.fecha)
    return k >= ini && k <= fin
  }

  // Totales de cada negocio en el período.
  const porNegocio = NEGOCIOS.map((n) => {
    const filtradas = ventas.filter(
      (v) => (v.canal || NEGOCIO_DEFECTO) === n.id && enPeriodo(v),
    )
    const r = calcularResumen(filtradas)
    return { ...n, total: r.total, clientes: r.clientes }
  })

  const totalGeneral = porNegocio.reduce((a, x) => a + x.total, 0)
  const clientesGeneral = porNegocio.reduce((a, x) => a + x.clientes, 0)

  const tituloPeriodo =
    modo === 'dia'
      ? formatFechaLarga(dia)
      : ini === fin
        ? formatFechaLarga(ini)
        : `Del ${formatFechaLarga(ini)} al ${formatFechaLarga(fin)}`

  return (
    <div className="general">
      {/* ----- Selector de fecha / rango ----- */}
      <div className="card general__controles">
        <div className="periodo">
          <button
            className={`periodo__btn ${modo === 'dia' ? 'is-active' : ''}`}
            onClick={() => setModo('dia')}
          >
            📆 Un día
          </button>
          <button
            className={`periodo__btn ${modo === 'rango' ? 'is-active' : ''}`}
            onClick={() => setModo('rango')}
          >
            🗓️ Rango de fechas
          </button>
        </div>

        {modo === 'dia' ? (
          <div className="form__group">
            <label className="form__label" htmlFor="g-dia">Fecha</label>
            <input
              id="g-dia"
              type="date"
              className="form__control"
              value={dia}
              max={hoy}
              onChange={(e) => setDia(e.target.value || hoy)}
            />
          </div>
        ) : (
          <div className="general__rango">
            <div className="form__group">
              <label className="form__label" htmlFor="g-desde">Desde</label>
              <input
                id="g-desde"
                type="date"
                className="form__control"
                value={desde}
                max={hoy}
                onChange={(e) => setDesde(e.target.value || hoy)}
              />
            </div>
            <div className="form__group">
              <label className="form__label" htmlFor="g-hasta">Hasta</label>
              <input
                id="g-hasta"
                type="date"
                className="form__control"
                value={hasta}
                max={hoy}
                onChange={(e) => setHasta(e.target.value || hoy)}
              />
            </div>
          </div>
        )}
      </div>

      {/* ----- Resultados del período ----- */}
      <section>
        <h2 className="seccion__titulo">💰 {tituloPeriodo}</h2>
        <div className="resumen">
          <div className="card resumen__card resumen__card--total">
            <span className="resumen__icono">💰</span>
            <span className="resumen__label">Total del período (los 3 negocios)</span>
            <span className="resumen__valor">{formatMoney(totalGeneral)}</span>
            <span className="resumen__detalle resumen__detalle--claro">
              👥 {clientesGeneral} clientes en total
            </span>
          </div>

          {porNegocio.map((n) => (
            <div key={n.id} className="card resumen__card">
              <span className="resumen__icono">{n.icono}</span>
              <span className="resumen__label">{n.label}</span>
              <span className="resumen__valor">{formatMoney(n.total)}</span>
              <span className="resumen__detalle">👥 {n.clientes} clientes</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
