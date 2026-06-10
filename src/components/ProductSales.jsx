import { useState, useMemo } from 'react'
import {
  todayKey,
  dateKey,
  monthKey,
  currentMonthKey,
  formatMoney,
  formatFechaLarga,
  formatMes,
} from '../utils/format.js'
import { ventasPorProducto } from '../utils/resumen.js'

/**
 * Ventas por producto: muestra cuánto se vendió de CADA producto en el período
 * elegido (hoy, este mes, un día puntual o un rango desde-hasta). Lista unidades
 * y dinero por producto, y permite exportar el detalle a PDF.
 * @param {Array} ventas Todas las ventas del negocio activo.
 */
export default function ProductSales({ ventas }) {
  const [periodo, setPeriodo] = useState('hoy') // 'hoy' | 'mes' | 'fecha' | 'rango'
  const [fecha, setFecha] = useState(todayKey())
  const [desde, setDesde] = useState(todayKey())
  const [hasta, setHasta] = useState(todayKey())

  // Ventas que entran en el período elegido.
  const ventasPeriodo = useMemo(() => {
    if (periodo === 'hoy') {
      const hoy = todayKey()
      return ventas.filter((v) => dateKey(v.fecha) === hoy)
    }
    if (periodo === 'mes') {
      const mes = currentMonthKey()
      return ventas.filter((v) => monthKey(v.fecha) === mes)
    }
    if (periodo === 'fecha') {
      return ventas.filter((v) => dateKey(v.fecha) === fecha)
    }
    // Rango: incluye ambos extremos. Si están invertidos, los ordenamos.
    const ini = desde <= hasta ? desde : hasta
    const fin = desde <= hasta ? hasta : desde
    return ventas.filter((v) => {
      const k = dateKey(v.fecha)
      return k >= ini && k <= fin
    })
  }, [ventas, periodo, fecha, desde, hasta])

  const filas = useMemo(() => ventasPorProducto(ventasPeriodo), [ventasPeriodo])

  const totales = useMemo(
    () =>
      filas.reduce(
        (acc, f) => ({ unidades: acc.unidades + f.unidades, total: acc.total + f.total }),
        { unidades: 0, total: 0 },
      ),
    [filas],
  )

  // Texto descriptivo del período mostrado.
  const descripcion = useMemo(() => {
    if (periodo === 'hoy') return formatFechaLarga(todayKey())
    if (periodo === 'mes') return formatMes(currentMonthKey())
    if (periodo === 'fecha') return formatFechaLarga(fecha)
    const ini = desde <= hasta ? desde : hasta
    const fin = desde <= hasta ? hasta : desde
    return `Del ${formatFechaLarga(ini)} al ${formatFechaLarga(fin)}`
  }, [periodo, fecha, desde, hasta])

  async function exportarPDF() {
    if (filas.length === 0) return
    // Carga jsPDF solo al exportar, para no pesar en la carga inicial.
    const { descargarPDFProductos } = await import('../utils/pdf.js')
    // Sufijo del nombre de archivo según el período.
    let nombreArchivo
    if (periodo === 'hoy') nombreArchivo = todayKey()
    else if (periodo === 'mes') nombreArchivo = currentMonthKey()
    else if (periodo === 'fecha') nombreArchivo = fecha
    else {
      const ini = desde <= hasta ? desde : hasta
      const fin = desde <= hasta ? hasta : desde
      nombreArchivo = `${ini}_a_${fin}`
    }
    descargarPDFProductos(filas, { titulo: descripcion, totales, nombreArchivo })
  }

  return (
    <section className="seccion">
      <h2 className="seccion__titulo">📦 Ventas por producto</h2>

      <div className="card">
        <div className="periodo">
          <button
            className={`btn btn--secundario ${periodo === 'hoy' ? 'is-activo' : ''}`}
            onClick={() => setPeriodo('hoy')}
          >
            Hoy
          </button>
          <button
            className={`btn btn--secundario ${periodo === 'mes' ? 'is-activo' : ''}`}
            onClick={() => setPeriodo('mes')}
          >
            Este mes
          </button>
          <button
            className={`btn btn--secundario ${periodo === 'fecha' ? 'is-activo' : ''}`}
            onClick={() => setPeriodo('fecha')}
          >
            Elegir día
          </button>
          <button
            className={`btn btn--secundario ${periodo === 'rango' ? 'is-activo' : ''}`}
            onClick={() => setPeriodo('rango')}
          >
            Rango de fechas
          </button>
        </div>

        {periodo === 'fecha' && (
          <div className="periodo__fechas">
            <div className="form__group">
              <label className="form__label" htmlFor="prod-fecha">Día</label>
              <input
                id="prod-fecha"
                type="date"
                className="form__control"
                value={fecha}
                max={todayKey()}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>
          </div>
        )}

        {periodo === 'rango' && (
          <div className="periodo__fechas">
            <div className="form__group">
              <label className="form__label" htmlFor="prod-desde">Desde</label>
              <input
                id="prod-desde"
                type="date"
                className="form__control"
                value={desde}
                max={todayKey()}
                onChange={(e) => setDesde(e.target.value)}
              />
            </div>
            <div className="form__group">
              <label className="form__label" htmlFor="prod-hasta">Hasta</label>
              <input
                id="prod-hasta"
                type="date"
                className="form__control"
                value={hasta}
                max={todayKey()}
                onChange={(e) => setHasta(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="periodo__pie">
          <p className="periodo__desc">{descripcion}</p>
          <button
            className="btn btn--secundario"
            onClick={exportarPDF}
            disabled={filas.length === 0}
          >
            📄 Exportar PDF
          </button>
        </div>

        {filas.length === 0 ? (
          <div className="tabla__vacio">
            <span className="tabla__vacio-icono">📭</span>
            <p>No hay ventas en este período</p>
          </div>
        ) : (
          <div className="tabla__contenedor">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th className="tabla__num">Unidades</th>
                  <th className="tabla__num">Total</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((f) => (
                  <tr key={f.producto} className="tabla__fila">
                    <td>{f.producto}</td>
                    <td className="tabla__num">{f.unidades}</td>
                    <td className="tabla__num tabla__total">{formatMoney(f.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th>Total ({filas.length} productos)</th>
                  <th className="tabla__num">{totales.unidades}</th>
                  <th className="tabla__num tabla__total">{formatMoney(totales.total)}</th>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
