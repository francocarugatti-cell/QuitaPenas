import { useMemo, useState } from 'react'
import {
  currentMonthKey,
  monthKey,
  formatMes,
  formatMoney,
} from '../utils/format.js'

/**
 * Gráfico de barras con las ventas (totales) por día del mes seleccionado.
 * Dibujado con SVG puro, sin librerías de gráficos.
 * @param {Array} ventas Todas las ventas registradas.
 */
export default function MonthlyChart({ ventas }) {
  const [mes, setMes] = useState(currentMonthKey())

  const datos = useMemo(() => {
    const [año, mesNum] = mes.split('-').map(Number)
    const diasEnMes = new Date(año, mesNum, 0).getDate()

    // Inicializa un total por cada día del mes.
    const totalPorDia = Array.from({ length: diasEnMes }, () => 0)
    let totalMes = 0

    for (const v of ventas) {
      if (monthKey(v.fecha) !== mes) continue
      const dia = new Date(v.fecha).getDate()
      totalPorDia[dia - 1] += v.total
      totalMes += v.total
    }

    const maximo = Math.max(...totalPorDia, 0)
    let mejorDia = 0
    totalPorDia.forEach((t, i) => {
      if (t > totalPorDia[mejorDia]) mejorDia = i
    })

    return {
      totalPorDia,
      totalMes,
      maximo,
      diasEnMes,
      mejorDia: maximo > 0 ? mejorDia + 1 : null,
      mejorDiaTotal: maximo,
    }
  }, [ventas, mes])

  // Dimensiones del lienzo SVG (se escala con viewBox).
  const ANCHO = 760
  const ALTO = 240
  const PAD_ABAJO = 26
  const PAD_ARRIBA = 12
  const alturaUtil = ALTO - PAD_ABAJO - PAD_ARRIBA
  const anchoBarra = ANCHO / datos.diasEnMes
  const hayVentas = datos.maximo > 0

  return (
    <section className="grafico card" aria-label="Ventas del mes">
      <div className="grafico__cabecera">
        <h2 className="card__title" style={{ marginBottom: 0 }}>📊 Ventas del mes</h2>
        <input
          type="month"
          className="form__control grafico__mes"
          value={mes}
          max={currentMonthKey()}
          onChange={(e) => setMes(e.target.value || currentMonthKey())}
        />
      </div>

      <div className="grafico__resumen">
        <div>
          <span className="grafico__resumen-label">Total {formatMes(mes)}</span>
          <span className="grafico__resumen-valor">{formatMoney(datos.totalMes)}</span>
        </div>
        {datos.mejorDia && (
          <div className="grafico__resumen-mejor">
            <span className="grafico__resumen-label">Mejor día</span>
            <span className="grafico__resumen-valor">
              Día {datos.mejorDia} · {formatMoney(datos.mejorDiaTotal)}
            </span>
          </div>
        )}
      </div>

      {hayVentas ? (
        <div className="grafico__lienzo">
          <svg
            viewBox={`0 0 ${ANCHO} ${ALTO}`}
            preserveAspectRatio="none"
            role="img"
            aria-label={`Gráfico de ventas diarias de ${formatMes(mes)}`}
          >
            {datos.totalPorDia.map((total, i) => {
              const h = datos.maximo > 0 ? (total / datos.maximo) * alturaUtil : 0
              const x = i * anchoBarra
              const y = PAD_ARRIBA + (alturaUtil - h)
              const esMejor = datos.mejorDia === i + 1
              return (
                <g key={i}>
                  <rect
                    x={x + anchoBarra * 0.15}
                    y={y}
                    width={anchoBarra * 0.7}
                    height={h}
                    rx="3"
                    className={`grafico__barra ${esMejor ? 'grafico__barra--top' : ''}`}
                  >
                    <title>{`Día ${i + 1}: ${formatMoney(total)}`}</title>
                  </rect>
                  {/* Etiqueta de día cada 5 días para no saturar. */}
                  {(i === 0 || (i + 1) % 5 === 0) && (
                    <text
                      x={x + anchoBarra / 2}
                      y={ALTO - 8}
                      textAnchor="middle"
                      className="grafico__etiqueta"
                    >
                      {i + 1}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>
      ) : (
        <div className="grafico__vacio">
          <span className="grafico__vacio-icono">📈</span>
          <p>Sin ventas registradas en {formatMes(mes)}</p>
        </div>
      )}
    </section>
  )
}
