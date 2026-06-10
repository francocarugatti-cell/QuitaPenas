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
    `Efectivo: ${formatMoney(r.efectivo)}  (${r.efectivoCount} clientes)`,
    `Mercado Pago: ${formatMoney(r.mercadoPago)}  (${r.mercadoPagoCount} clientes)`,
    `Producto más vendido: ${r.productoTop || '—'}${r.productoTop ? ` (${r.productoTopUnidades} unidades)` : ''}`,
    `Clientes del día: ${r.clientes}`,
  ]
  lineas.forEach((linea, i) => doc.text(linea, margen, 124 + i * 18))

  // --- Tabla de ventas (agrupada por cliente) ---
  const cuerpo = agruparPorCliente(ventas).flatMap((c) =>
    c.items.map((v) => [
      c.nombre || `Cliente ${c.numero}`,
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
    body: cuerpo,
    styles: { font: 'helvetica', fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [74, 44, 24], textColor: 255 },
    alternateRowStyles: { fillColor: [253, 238, 221] },
    margin: { left: margen, right: margen },
  })

  doc.save(`ventas-quita-penas-${clave}.pdf`)
}

/**
 * Genera y descarga un PDF con el detalle de ventas por producto.
 * @param {Array}  filas       Productos con { producto, unidades, total }.
 * @param {Object} opciones
 * @param {string} opciones.titulo      Descripción del período (ej. "Junio 2026").
 * @param {Object} opciones.totales     { unidades, total } generales.
 * @param {string} opciones.nombreArchivo Sufijo para el nombre del archivo.
 */
export function descargarPDFProductos(filas, { titulo, totales, nombreArchivo }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
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
  doc.text('Ventas por producto', margen, 50)

  // --- Período ---
  doc.setTextColor(74, 44, 24)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(titulo, margen, 100)

  // --- Totales ---
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(60, 40, 25)
  doc.text(`Productos distintos: ${filas.length}`, margen, 124)
  doc.text(`Unidades vendidas: ${totales.unidades}`, margen, 142)
  doc.text(`Total recaudado: ${formatMoney(totales.total)}`, margen, 160)

  // --- Tabla por producto ---
  autoTable(doc, {
    startY: 185,
    head: [['Producto', 'Unidades', 'Total']],
    body: filas.map((f) => [f.producto, String(f.unidades), formatMoney(f.total)]),
    foot: [['Total', String(totales.unidades), formatMoney(totales.total)]],
    styles: { font: 'helvetica', fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [74, 44, 24], textColor: 255 },
    footStyles: { fillColor: [253, 238, 221], textColor: [74, 44, 24], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [253, 238, 221] },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
    margin: { left: margen, right: margen },
  })

  doc.save(`productos-quita-penas-${nombreArchivo}.pdf`)
}

/**
 * Genera y descarga un PDF consolidado del resumen general (los 3 negocios):
 * resumen de ventas por negocio + listado de productos vendidos sumando todo.
 * @param {Object} datos
 * @param {string} datos.titulo        Descripción del período.
 * @param {string} datos.nombreArchivo Sufijo para el nombre del archivo.
 * @param {Array}  datos.negocios      Por negocio: { label, icono, total, efectivo,
 *                                      mercadoPago, clientes, productos, totalesProductos }.
 * @param {Object} datos.totalesNegocios { total, efectivo, mercadoPago, clientes }.
 */
export function descargarPDFGeneral({
  titulo,
  nombreArchivo,
  negocios,
  totalesNegocios,
}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
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
  doc.text('Resumen general (todos los negocios)', margen, 50)

  // --- Período ---
  doc.setTextColor(74, 44, 24)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(titulo, margen, 100)

  // --- Tabla 1: ventas por negocio ---
  doc.setFontSize(12)
  doc.text('Ventas por negocio', margen, 126)
  autoTable(doc, {
    startY: 138,
    head: [['Negocio', 'Efectivo', 'Mercado Pago', 'Total', 'Clientes']],
    body: negocios.map((n) => [
      n.label,
      formatMoney(n.efectivo),
      formatMoney(n.mercadoPago),
      formatMoney(n.total),
      String(n.clientes),
    ]),
    foot: [[
      'Total general',
      formatMoney(totalesNegocios.efectivo),
      formatMoney(totalesNegocios.mercadoPago),
      formatMoney(totalesNegocios.total),
      String(totalesNegocios.clientes),
    ]],
    styles: { font: 'helvetica', fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [74, 44, 24], textColor: 255 },
    footStyles: { fillColor: [253, 238, 221], textColor: [74, 44, 24], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [253, 238, 221] },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
    },
    margin: { left: margen, right: margen },
  })

  // --- Productos vendidos, una tabla por cada negocio ---
  const altoPagina = doc.internal.pageSize.getHeight()

  for (const n of negocios) {
    if (n.productos.length === 0) continue

    let y = doc.lastAutoTable.finalY + 28
    // Si el título queda muy abajo, pasamos a una página nueva.
    if (y > altoPagina - 90) {
      doc.addPage()
      y = margen + 10
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(74, 44, 24)
    doc.text(`Productos vendidos — ${n.label}`, margen, y)

    autoTable(doc, {
      startY: y + 12,
      head: [['Producto', 'Unidades', 'Total']],
      body: n.productos.map((p) => [p.producto, String(p.unidades), formatMoney(p.total)]),
      foot: [['Total', String(n.totalesProductos.unidades), formatMoney(n.totalesProductos.total)]],
      styles: { font: 'helvetica', fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [74, 44, 24], textColor: 255 },
      footStyles: { fillColor: [253, 238, 221], textColor: [74, 44, 24], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [253, 238, 221] },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
      margin: { left: margen, right: margen },
    })
  }

  doc.save(`resumen-general-quita-penas-${nombreArchivo}.pdf`)
}
