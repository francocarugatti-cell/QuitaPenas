// Exportación de ventas a CSV sin librerías externas.
import { formatHora } from './format.js'
import { agruparPorCliente } from './resumen.js'

/** Escapa un valor para CSV (comillas y separadores). */
function escaparCampo(valor) {
  const texto = String(valor ?? '')
  if (/[";\n]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`
  }
  return texto
}

/**
 * Genera y descarga un CSV con las ventas indicadas.
 * @param {Array} ventas  Lista de ventas del día.
 * @param {string} clave  Clave del día (YYYY-MM-DD) para el nombre del archivo.
 */
export function descargarCSV(ventas, clave) {
  const cabecera = ['Cliente', 'Hora', 'Producto', 'Cantidad', 'Precio unitario', 'Total', 'Método de pago']

  // Una fila por producto, con el número de cliente al que pertenece.
  const filas = agruparPorCliente(ventas).flatMap((cliente) =>
    cliente.items.map((v) => [
      `Cliente ${cliente.numero}`,
      formatHora(v.fecha),
      v.producto,
      v.cantidad,
      v.precio.toFixed(2),
      v.total.toFixed(2),
      v.metodo,
    ]),
  )

  // Separador ";" y coma decimal funcionan mejor con Excel en español.
  const contenido = [cabecera, ...filas]
    .map((fila) => fila.map(escaparCampo).join(';'))
    .join('\n')

  // BOM para que Excel reconozca los acentos (UTF-8).
  const blob = new Blob(['﻿' + contenido], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = `ventas-${clave}.csv`
  document.body.appendChild(enlace)
  enlace.click()
  document.body.removeChild(enlace)
  URL.revokeObjectURL(url)
}
