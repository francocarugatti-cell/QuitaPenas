// Exportación de un reporte de ventas a PDF usando jsPDF + autotable.
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatMoney, formatHora, formatFechaLarga } from './format.js'
import { calcularResumen } from './resumen.js'

/**
 * Genera y descarga un PDF con el reporte del día indicado.
 * @param {Array} ventas Ventas del día (ya filtradas).
 * @param {string} clave Clave del día (YYYY-MM-DD), para el título y el archivo.
 */
export function descargarPDF(ventas, clave) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const r = calcularResumen(ventas)
  const margen = 40

  // --- Encabezado ---
  doc.setFillColor(234, 88, 12) // naranja
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 70, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('Quita Penas', margen, 32)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text('Reporte de ventas', margen, 50)

  // --- Fecha ---
  doc.setTextColor(74, 44, 24)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(formatFechaLarga(clave), margen, 100)

  // --- Resumen ---
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(60, 40, 25)
  const lineas = [
    `Total del día: ${formatMoney(r.total)}`,
    `Efectivo: ${formatMoney(r.efectivo)}  (${r.efectivoCount} transacciones)`,
    `Mercado Pago: ${formatMoney(r.mercadoPago)}  (${r.mercadoPagoCount} transacciones)`,
    `Producto más vendido: ${r.productoTop || '—'}${r.productoTop ? ` (${r.productoTopUnidades} unidades)` : ''}`,
    `Total de transacciones: ${r.transacciones}`,
  ]
  lineas.forEach((linea, i) => doc.text(linea, margen, 124 + i * 18))

  // --- Tabla de ventas ---
  const ordenadas = [...ventas].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
  autoTable(doc, {
    startY: 230,
    head: [['Hora', 'Producto', 'Cant.', 'Precio', 'Total', 'Pago']],
    body: ordenadas.map((v) => [
      formatHora(v.fecha),
      v.producto,
      String(v.cantidad),
      formatMoney(v.precio),
      formatMoney(v.total),
      v.metodo,
    ]),
    styles: { font: 'helvetica', fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [74, 44, 24], textColor: 255 },
    alternateRowStyles: { fillColor: [253, 238, 221] },
    margin: { left: margen, right: margen },
  })

  doc.save(`ventas-quita-penas-${clave}.pdf`)
}
