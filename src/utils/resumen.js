// Cálculo del resumen de un conjunto de ventas.

/**
 * Calcula totales, desglose por método de pago y producto más vendido.
 * @param {Array} ventas Lista de ventas (ya filtradas por día).
 */
export function calcularResumen(ventas) {
  const resumen = {
    total: 0,
    efectivo: 0,
    efectivoCount: 0,
    mercadoPago: 0,
    mercadoPagoCount: 0,
    transacciones: ventas.length,
    productoTop: null,
    productoTopUnidades: 0,
  }

  const unidadesPorProducto = {}

  for (const v of ventas) {
    resumen.total += v.total

    if (v.metodo === 'Efectivo') {
      resumen.efectivo += v.total
      resumen.efectivoCount += 1
    } else {
      resumen.mercadoPago += v.total
      resumen.mercadoPagoCount += 1
    }

    unidadesPorProducto[v.producto] = (unidadesPorProducto[v.producto] || 0) + v.cantidad
  }

  // Producto más vendido por unidades.
  for (const [producto, unidades] of Object.entries(unidadesPorProducto)) {
    if (unidades > resumen.productoTopUnidades) {
      resumen.productoTop = producto
      resumen.productoTopUnidades = unidades
    }
  }

  return resumen
}
