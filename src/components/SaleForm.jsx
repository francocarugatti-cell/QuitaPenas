import { useState } from 'react'
import { toDatetimeLocal, formatMoney } from '../utils/format.js'

// Genera un identificador único para agrupar los productos de un mismo cliente.
function nuevoClienteId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  // Respaldo simple por si el navegador no tiene crypto.randomUUID.
  return `c-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

// Valores iniciales del producto que se está cargando.
function itemInicial() {
  return { productoId: '', cantidad: '', precio: '' }
}

/**
 * Formulario de registro de venta por cliente (ticket/carrito).
 * Permite cargar varios productos a un mismo cliente y luego confirmarlos
 * todos juntos como una sola compra.
 * @param {Array} productos     Lista de productos disponibles { id, nombre, precio }.
 * @param {Function} onRegistrar Recibe las filas de venta listas para guardar.
 */
export default function SaleForm({ productos, onRegistrar }) {
  const [item, setItem] = useState(itemInicial)
  const [carrito, setCarrito] = useState([])
  const [metodo, setMetodo] = useState('Efectivo')
  const [fecha, setFecha] = useState(() => toDatetimeLocal(new Date()))
  const [errores, setErrores] = useState({})

  function actualizar(campo, valor) {
    setItem((prev) => ({ ...prev, [campo]: valor }))
    setErrores((prev) => ({ ...prev, [campo]: undefined }))
  }

  // Al elegir un producto, autocompleta el precio unitario (sigue siendo editable).
  function elegirProducto(id) {
    const producto = productos.find((p) => p.id === id)
    setItem((prev) => ({
      ...prev,
      productoId: id,
      precio: producto ? String(producto.precio) : prev.precio,
    }))
    setErrores((prev) => ({ ...prev, productoId: undefined, precio: undefined }))
  }

  function validarItem() {
    const nuevos = {}
    if (!item.productoId) nuevos.productoId = 'Elegí un producto'
    if (!item.cantidad || Number(item.cantidad) <= 0) nuevos.cantidad = 'Cantidad inválida'
    if (!item.precio || Number(item.precio) <= 0) nuevos.precio = 'Precio inválido'
    setErrores(nuevos)
    return Object.keys(nuevos).length === 0
  }

  // Agrega el producto cargado al carrito del cliente actual.
  function agregarAlCarrito() {
    if (!validarItem()) return

    const producto = productos.find((p) => p.id === item.productoId)
    const cantidad = Number(item.cantidad)
    const precio = Number(item.precio)

    setCarrito((prev) => [
      ...prev,
      {
        productoId: item.productoId,
        producto: producto ? producto.nombre : 'Producto',
        cantidad,
        precio,
        total: Math.round(cantidad * precio * 100) / 100,
      },
    ])

    // Listo para cargar el siguiente producto del mismo cliente.
    setItem(itemInicial())
  }

  function quitarDelCarrito(indice) {
    setCarrito((prev) => prev.filter((_, i) => i !== indice))
  }

  const totalCarrito = carrito.reduce((acc, it) => acc + it.total, 0)

  // Confirma el cliente: guarda todos sus productos con un mismo cliente_id.
  function confirmarCliente(e) {
    e.preventDefault()
    if (carrito.length === 0) {
      setErrores((prev) => ({ ...prev, carrito: 'Agregá al menos un producto' }))
      return
    }
    if (!fecha) {
      setErrores((prev) => ({ ...prev, fecha: 'Falta la fecha y hora' }))
      return
    }

    const clienteId = nuevoClienteId()
    const fechaISO = new Date(fecha).toISOString()

    const filas = carrito.map((it) => ({
      cliente_id: clienteId,
      producto: it.producto,
      cantidad: it.cantidad,
      precio: it.precio,
      total: it.total,
      metodo,
      fecha: fechaISO,
    }))

    onRegistrar(filas)

    // Reinicia para el próximo cliente.
    setCarrito([])
    setItem(itemInicial())
    setMetodo('Efectivo')
    setFecha(toDatetimeLocal(new Date()))
    setErrores({})
  }

  return (
    <form className="card form" onSubmit={confirmarCliente} noValidate>
      <h2 className="card__title">🧑 Registrar cliente</h2>

      <div className="form__group">
        <label className="form__label" htmlFor="producto">Producto</label>
        <select
          id="producto"
          className={`form__control ${errores.productoId ? 'is-error' : ''}`}
          value={item.productoId}
          onChange={(e) => elegirProducto(e.target.value)}
        >
          <option value="">Seleccionar producto…</option>
          {productos.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
        {errores.productoId && <span className="form__error">{errores.productoId}</span>}
      </div>

      <div className="form__row">
        <div className="form__group">
          <label className="form__label" htmlFor="cantidad">Cantidad</label>
          <input
            id="cantidad"
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            placeholder="0"
            className={`form__control ${errores.cantidad ? 'is-error' : ''}`}
            value={item.cantidad}
            onChange={(e) => actualizar('cantidad', e.target.value)}
          />
          {errores.cantidad && <span className="form__error">{errores.cantidad}</span>}
        </div>

        <div className="form__group">
          <label className="form__label" htmlFor="precio">Precio unitario ($)</label>
          <input
            id="precio"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="0,00"
            className={`form__control ${errores.precio ? 'is-error' : ''}`}
            value={item.precio}
            onChange={(e) => actualizar('precio', e.target.value)}
          />
          {errores.precio && <span className="form__error">{errores.precio}</span>}
        </div>
      </div>

      <button type="button" className="btn btn--secundario btn--block" onClick={agregarAlCarrito}>
        ➕ Agregar producto al cliente
      </button>

      {/* Carrito del cliente actual */}
      <div className="carrito">
        <div className="carrito__cabecera">
          <span className="carrito__titulo">🛒 Productos de este cliente</span>
          {carrito.length > 0 && (
            <span className="carrito__contador">{carrito.length}</span>
          )}
        </div>

        {carrito.length === 0 ? (
          <p className="carrito__vacio">
            Todavía no agregaste productos. Cargá uno o varios y después confirmá el cliente.
          </p>
        ) : (
          <ul className="carrito__lista">
            {carrito.map((it, i) => (
              <li key={i} className="carrito__item">
                <div className="carrito__info">
                  <span className="carrito__nombre">{it.producto}</span>
                  <span className="carrito__detalle">
                    {it.cantidad} × {formatMoney(it.precio)}
                  </span>
                </div>
                <span className="carrito__total">{formatMoney(it.total)}</span>
                <button
                  type="button"
                  className="btn btn--icono btn--peligro"
                  onClick={() => quitarDelCarrito(i)}
                  aria-label={`Quitar ${it.producto}`}
                  title="Quitar"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        {carrito.length > 0 && (
          <div className="carrito__resumen">
            <span>Total del cliente</span>
            <strong>{formatMoney(totalCarrito)}</strong>
          </div>
        )}
        {errores.carrito && <span className="form__error">{errores.carrito}</span>}
      </div>

      <div className="form__group">
        <span className="form__label">Método de pago</span>
        <div className="pago">
          <label className={`pago__opcion ${metodo === 'Efectivo' ? 'is-active' : ''}`}>
            <input
              type="radio"
              name="metodo"
              value="Efectivo"
              checked={metodo === 'Efectivo'}
              onChange={(e) => setMetodo(e.target.value)}
            />
            💵 Efectivo
          </label>
          <label className={`pago__opcion ${metodo === 'Mercado Pago' ? 'is-active' : ''}`}>
            <input
              type="radio"
              name="metodo"
              value="Mercado Pago"
              checked={metodo === 'Mercado Pago'}
              onChange={(e) => setMetodo(e.target.value)}
            />
            📱 Mercado Pago
          </label>
        </div>
      </div>

      <div className="form__group">
        <label className="form__label" htmlFor="fecha">Fecha y hora</label>
        <input
          id="fecha"
          type="datetime-local"
          className={`form__control ${errores.fecha ? 'is-error' : ''}`}
          value={fecha}
          onChange={(e) => {
            setFecha(e.target.value)
            setErrores((prev) => ({ ...prev, fecha: undefined }))
          }}
        />
        {errores.fecha && <span className="form__error">{errores.fecha}</span>}
      </div>

      <button type="submit" className="btn btn--primary btn--block" disabled={carrito.length === 0}>
        ✅ Confirmar cliente{carrito.length > 0 ? ` (${formatMoney(totalCarrito)})` : ''}
      </button>
    </form>
  )
}
