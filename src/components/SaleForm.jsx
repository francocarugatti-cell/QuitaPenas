import { useState } from 'react'
import { toDatetimeLocal, formatMoney } from '../utils/format.js'

// Valores iniciales del producto que se está por agregar al cliente.
function itemInicial() {
  return {
    productoId: '',
    cantidad: '',
    precio: '',
  }
}

/**
 * Formulario de registro de venta por cliente (carrito).
 * Se agregan varios productos a un mismo cliente y al final se cobra todo junto.
 * @param {Array} productos     Lista de productos disponibles { id, nombre, precio }.
 * @param {Function} onRegistrar Recibe { items, metodo, fecha } del cliente a guardar.
 */
export default function SaleForm({ productos, onRegistrar }) {
  const [item, setItem] = useState(itemInicial)
  const [items, setItems] = useState([]) // Productos del cliente actual.
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

  // Agrega el producto actual al carrito del cliente.
  function agregarItem(e) {
    e.preventDefault()
    if (!validarItem()) return

    const producto = productos.find((p) => p.id === item.productoId)
    const cantidad = Number(item.cantidad)
    const precio = Number(item.precio)

    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(), // id temporal solo para la lista en pantalla
        producto: producto ? producto.nombre : 'Producto',
        cantidad,
        precio,
        total: Math.round(cantidad * precio * 100) / 100,
      },
    ])
    setItem(itemInicial())
  }

  function quitarItem(id) {
    setItems((prev) => prev.filter((it) => it.id !== id))
  }

  const totalCliente = items.reduce((acc, it) => acc + it.total, 0)

  // Cobra al cliente: guarda todos sus productos como una sola compra.
  function cobrar() {
    if (items.length === 0) return
    onRegistrar({
      items: items.map(({ producto, cantidad, precio, total }) => ({
        producto,
        cantidad,
        precio,
        total,
      })),
      metodo,
      fecha: new Date(fecha).toISOString(),
    })
    // Reinicia para el siguiente cliente.
    setItems([])
    setItem(itemInicial())
    setMetodo('Efectivo')
    setFecha(toDatetimeLocal(new Date()))
  }

  return (
    <div className="card form">
      <h2 className="card__title">🧺 Cargar cliente</h2>

      {/* --- Agregar un producto al cliente --- */}
      <form className="form" onSubmit={agregarItem} noValidate>
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

        <button type="submit" className="btn btn--secundario btn--block">
          ➕ Agregar producto al cliente
        </button>
      </form>

      {/* --- Datos del cobro (uno por cliente) --- */}
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
          className="form__control"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
      </div>

      {/* --- Productos ya agregados al cliente --- */}
      {items.length > 0 ? (
        <ul className="carrito">
          {items.map((it) => (
            <li key={it.id} className="carrito__item">
              <span className="carrito__cant">{it.cantidad}×</span>
              <span className="carrito__nombre">{it.producto}</span>
              <span className="carrito__total">{formatMoney(it.total)}</span>
              <button
                type="button"
                className="btn btn--icono btn--peligro"
                onClick={() => quitarItem(it.id)}
                aria-label={`Quitar ${it.producto}`}
                title="Quitar"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="carrito__vacio">
          Agregá los productos que lleva este cliente y después cobrá todo junto.
        </p>
      )}

      {/* --- Total y cobro --- */}
      <div className="carrito__cobro">
        <div className="carrito__cobro-total">
          <span className="carrito__cobro-label">Total del cliente</span>
          <span className="carrito__cobro-valor">{formatMoney(totalCliente)}</span>
        </div>
        <button
          type="button"
          className="btn btn--primary btn--block"
          onClick={cobrar}
          disabled={items.length === 0}
        >
          ✅ Cobrar cliente
        </button>
      </div>
    </div>
  )
}
