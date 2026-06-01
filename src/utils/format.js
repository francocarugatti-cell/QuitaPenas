// Utilidades de formato (dinero, fechas) para toda la app.
// Se usa la configuración regional de Argentina (es-AR).

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const DIAS = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles',
  'Jueves', 'Viernes', 'Sábado',
]

/** Formatea un número como dinero: 1234.5 -> "$ 1.234,50" */
export function formatMoney(valor) {
  const numero = Number(valor) || 0
  return numero.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/** Devuelve la clave de día (YYYY-MM-DD) a partir de una fecha ISO o Date. */
export function dateKey(fecha) {
  const d = new Date(fecha)
  const año = d.getFullYear()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${año}-${mes}-${dia}`
}

/** Clave del día de hoy. */
export function todayKey() {
  return dateKey(new Date())
}

/** Devuelve la clave de mes (YYYY-MM) a partir de una fecha ISO o Date. */
export function monthKey(fecha) {
  const d = new Date(fecha)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** Clave del mes actual. */
export function currentMonthKey() {
  return monthKey(new Date())
}

/** Nombre legible de un mes a partir de su clave: "2026-06" -> "Junio 2026" */
export function formatMes(claveMes) {
  const [a, m] = claveMes.split('-').map(Number)
  return `${MESES[m - 1]} ${a}`
}

/** Hora corta legible: "14:30" */
export function formatHora(fecha) {
  const d = new Date(fecha)
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

/** Fecha y hora legible: "01 de Junio, 14:30" */
export function formatFechaHora(fecha) {
  const d = new Date(fecha)
  const dia = String(d.getDate()).padStart(2, '0')
  return `${dia} de ${MESES[d.getMonth()]}, ${formatHora(d)}`
}

/** Fecha larga con día de la semana: "Lunes 01 de Junio de 2026" */
export function formatFechaLarga(claveOFecha) {
  // Acepta una clave "YYYY-MM-DD" o un objeto/cadena de fecha.
  let d
  if (typeof claveOFecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(claveOFecha)) {
    const [a, m, dd] = claveOFecha.split('-').map(Number)
    d = new Date(a, m - 1, dd)
  } else {
    d = new Date(claveOFecha)
  }
  return `${DIAS[d.getDay()]} ${String(d.getDate()).padStart(2, '0')} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`
}

/** Convierte un Date a string compatible con <input type="datetime-local">. */
export function toDatetimeLocal(fecha) {
  const d = new Date(fecha)
  // Ajuste para mostrar la hora local en el input.
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}
