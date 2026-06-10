// Cálculo del resumen de un conjunto de ventas y agrupación por cliente.

/**
 * Agrupa las ventas por cliente (ticket). Cada cliente es una compra que puede
 * llevar varios productos. Las ventas viejas sin ticket se tratan como un
 * cliente individual (usando su propio id como clave).
 * @param {Array} ventas Lista de ventas (filas de producto).
 * @returns {Array} Clientes ordenados por hora ascendente, con número correlativo.
 */
export function agruparPorCliente(ventas) {
  const mapa = new Map()

  for (const v of ventas) {
    const clave = v.ticket || v.id
    let cliente = mapa.get(clave)
    if (!cliente) {
      cliente = {
        ticket: clave,
        nombre: v.cliente || null,
        items: [],
        ids: [],
        total: 0,
        metodo: v.metodo,
        fecha: v.fecha,
      }
      mapa.set(clave, cliente)
    }
    cliente.items.push(v)
    cliente.ids.push(v.id)
    cliente.total += v.total
    // La hora del cliente es la del primer producto que cargó.
    if (new Date(v.fecha) < new Date(cliente.fecha)) cliente.fecha = v.fecha
  }

  const clientes = [...mapa.values()].sort(
    (a, b) => new Date(a.fecha) - new Date(b.fecha),
  )
  clientes.forEach((c, i) => {
    c.numero = i + 1
  })
  return clientes
}

/**
 * Agrupa las ventas por producto y suma unidades y dinero de cada uno.
 * @param {Array} ventas Lista de ventas (filas de producto), ya filtradas por período.
 * @returns {Array} Productos ordenados por unidades vendidas (de mayor a menor).
 */
export function ventasPorProducto(ventas) {
  const mapa = new Map()

  for (const v of ventas) {
    let p = mapa.get(v.producto)
    if (!p) {
      p = { producto: v.producto, unidades: 0, total: 0 }
      mapa.set(v.producto, p)
    }
    p.unidades += v.cantidad
    p.total += v.total
  }

  return [...mapa.values()].sort((a, b) => b.unidades - a.unidades)
}

/**
 * Calcula totales, desglose por método de pago, producto más vendido y
 * cantidad de clientes. Los métodos se cuentan por cliente, no por producto.
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
    clientes: clientes.length,
    productoTop: null,
    productoTopUnidades: 0,
  }

  const unidadesPorProducto = {}

  for (const cliente of clientes) {
    resumen.total += cliente.total

    if (cliente.metodo === 'Efectivo') {
      resumen.efectivo += cliente.total
      resumen.efectivoCount += 1
    } else {
      resumen.mercadoPago += cliente.total
      resumen.mercadoPagoCount += 1
    }

    for (const item of cliente.items) {
      unidadesPorProducto[item.producto] =
        (unidadesPorProducto[item.producto] || 0) + item.cantidad
    }
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
