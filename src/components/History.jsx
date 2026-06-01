import { useState } from 'react'
import DaySummary from './DaySummary.jsx'
import SalesTable from './SalesTable.jsx'
import { todayKey, dateKey, formatFechaLarga } from '../utils/format.js'
import { descargarCSV } from '../utils/csv.js'

/**
 * Historial: permite elegir una fecha y ver su resumen y ventas.
 * Es colapsable (cerrado por defecto en móvil).
 * @param {Array} ventas Todas las ventas registradas.
 */
export default function History({ ventas }) {
  const [abierto, setAbierto] = useState(false)
  const [fecha, setFecha] = useState(todayKey())

  // Ventas del día seleccionado.
  const ventasDelDia = ventas.filter((v) => dateKey(v.fecha) === fecha)

  function exportarCSV() {
    if (ventasDelDia.length === 0) return
    descargarCSV(ventasDelDia, fecha)
  }

  async function exportarPDF() {
    if (ventasDelDia.length === 0) return
    // Carga jsPDF solo al exportar, para no pesar en la carga inicial.
    const { descargarPDF } = await import('../utils/pdf.js')
    descargarPDF(ventasDelDia, fecha)
  }

  return (
    <section className="historial">
      <button
        className="historial__toggle"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
      >
        <span>📅 Historial y otros días</span>
        <span className={`historial__flecha ${abierto ? 'is-open' : ''}`}>▾</span>
      </button>

      {abierto && (
        <div className="historial__contenido">
          <div className="historial__controles">
            <div className="form__group">
              <label className="form__label" htmlFor="fecha-historial">Elegí una fecha</label>
              <input
                id="fecha-historial"
                type="date"
                className="form__control"
                value={fecha}
                max={todayKey()}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>
            <div className="historial__export">
              <button
                className="btn btn--secundario"
                onClick={exportarCSV}
                disabled={ventasDelDia.length === 0}
              >
                📥 CSV
              </button>
              <button
                className="btn btn--secundario"
                onClick={exportarPDF}
                disabled={ventasDelDia.length === 0}
              >
                📄 PDF
              </button>
            </div>
          </div>

          <p className="historial__fecha">{formatFechaLarga(fecha)}</p>

          <DaySummary ventas={ventasDelDia} />
          <SalesTable ventas={ventasDelDia} onEliminar={null} />
        </div>
      )}
    </section>
  )
}
