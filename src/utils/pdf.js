// Exportación de un reporte de ventas a PDF usando jsPDF + autotable.
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatMoney, formatHora, formatFechaLarga } from './format.js'
import { calcularResumen, agruparPorCliente } from './resumen.js'

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
    `Clientes del día: ${r.clientes}  (${r.productosVendidos} productos)`,
    `Efectivo: ${formatMoney(r.efectivo)}  (${r.efectivoCount} clientes)`,
    `Mercado Pago: ${formatMoney(r.mercadoPago)}  (${r.mercadoPagoCount} clientes)`,
    `Producto más vendido: ${r.productoTop || '—'}${r.productoTop ? ` (${r.productoTopUnidades} unidades)` : ''}`,
  ]
  lineas.forEach((linea, i) => doc.text(linea, margen, 124 + i * 18))

  // --- Tabla de ventas (agrupada por cliente) ---
  const clientes = agruparPorCliente(ventas)
  const filas = clientes.flatMap((cliente) =>
    cliente.items.map((v) => [
      `Cliente ${cliente.numero}`,
      formatHora(v.fecha),
      v.producto,
      String(v.cantidad),
      formatMoney(v.precio),
      formatMoney(v.total),
      v.metodo,
    ]),
  )
  autoTable(doc, {
    startY: 230,
    head: [['Cliente', 'Hora', 'Producto', 'Cant.', 'Precio', 'Total', 'Pago']],
    body: filas,
    styles: { font: 'helvetica', fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [74, 44, 24], textColor: 255 },
    alternateRowStyles: { fillColor: [253, 238, 221] },
    margin: { left: margen, right: margen },
  })

  doc.save(`ventas-quita-penas-${clave}.pdf`)
}
