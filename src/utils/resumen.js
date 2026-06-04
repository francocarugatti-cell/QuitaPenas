// Cálculo del resumen de un conjunto de ventas y agrupación por cliente.

/**
 * Agrupa las ventas por cliente (ticket). Las filas que comparten el mismo
 * `cliente_id` son la misma compra (un cliente que llevó varios productos).
 * Las ventas antiguas sin `cliente_id` se tratan como un cliente cada una.
 *
 * Devuelve una lista de clientes ordenada por hora (el primero del día es el
 * "Cliente 1") con: { clave, numero, items, total, fecha, metodo }.
 * @param {Array} ventas Lista de ventas (normalmente ya filtradas por día).
 */
export function agruparPorCliente(ventas) {
  const grupos = new Map()

  for (const v of ventas) {
    // Si no tiene cliente_id (datos viejos), cada venta es su propio cliente.
    const clave = v.cliente_id || `solo:${v.id}`

    if (!grupos.has(clave)) {
      grupos.set(clave, {
        clave,
        items: [],
        total: 0,
        fecha: v.fecha,
        metodos: new Set(),
      })
    }

    const grupo = grupos.get(clave)
    grupo.items.push(v)
    grupo.total += v.total
    grupo.metodos.add(v.metodo)
    // La hora del ticket es la del primer producto cargado.
    if (new Date(v.fecha) < new Date(grupo.fecha)) grupo.fecha = v.fecha
  }

  // Orden por hora ascendente para numerar (Cliente 1 = el primero del día).
  const lista = [...grupos.values()].sort(
    (a, b) => new Date(a.fecha) - new Date(b.fecha),
  )

  lista.forEach((grupo, i) => {
    grupo.numero = i + 1
    // Si todo el ticket se pagó igual, mostramos ese método; si no, "Mixto".
    grupo.metodo = grupo.metodos.size === 1 ? [...grupo.metodos][0] : 'Mixto'
    delete grupo.metodos
  })

  return lista
}

/**
 * Calcula totales, desglose por método de pago, cantidad de clientes y
 * producto más vendido.
 * @param {Array} ventas Lista de ventas (ya filtradas por día).
 */
export function calcularResumen(ventas) {
  const clientes = agruparPorCliente(ventas)

  const resumen = {
    total: 0,
    efectivo: 0,
    efectivoCount: 0,
    mercadoPago: 0,
    mercadoPagoCount: 0,
    // Clientes (tickets) del día y cantidad de productos vendidos.
    clientes: clientes.length,
    productosVendidos: ventas.length,
    // Se conserva por compatibilidad: cantidad de líneas de venta.
    transacciones: ventas.length,
    productoTop: null,
    productoTopUnidades: 0,
  }

  const unidadesPorProducto = {}

  // Importes por método (sumados línea a línea).
  for (const v of ventas) {
    resumen.total += v.total
    if (v.metodo === 'Efectivo') resumen.efectivo += v.total
    else resumen.mercadoPago += v.total

    unidadesPorProducto[v.producto] = (unidadesPorProducto[v.producto] || 0) + v.cantidad
  }

  // Cantidad de clientes por método de pago del ticket.
  for (const cliente of clientes) {
    if (cliente.metodo === 'Efectivo') resumen.efectivoCount += 1
    else if (cliente.metodo === 'Mercado Pago') resumen.mercadoPagoCount += 1
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
