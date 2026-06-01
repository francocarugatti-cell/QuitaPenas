import { useState } from 'react'
import { toDatetimeLocal } from '../utils/format.js'

// Valores iniciales del formulario.
function estadoInicial() {
  return {
    productoId: '',
    cantidad: '',
    precio: '',
    metodo: 'Efectivo',
    fecha: toDatetimeLocal(new Date()),
  }
}

/**
 * Formulario de registro de venta.
 * @param {Array} productos    Lista de productos disponibles { id, nombre, precio }.
 * @param {Function} onRegistrar Recibe la venta validada lista para guardar.
 */
export default function SaleForm({ productos, onRegistrar }) {
  const [datos, setDatos] = useState(estadoInicial)
  const [errores, setErrores] = useState({})

  function actualizar(campo, valor) {
    setDatos((prev) => ({ ...prev, [campo]: valor }))
    setErrores((prev) => ({ ...prev, [campo]: undefined }))
  }

  // Al elegir un producto, autocompleta el precio unitario (sigue siendo editable).
  function elegirProducto(id) {
    const producto = productos.find((p) => p.id === id)
    setDatos((prev) => ({
      ...prev,
      productoId: id,
      precio: producto ? String(producto.precio) : prev.precio,
    }))
    setErrores((prev) => ({ ...prev, productoId: undefined, precio: undefined }))
  }

  function validar() {
    const nuevos = {}
    if (!datos.productoId) nuevos.productoId = 'Elegí un producto'
    if (!datos.cantidad || Number(datos.cantidad) <= 0) nuevos.cantidad = 'Cantidad inválida'
    if (!datos.precio || Number(datos.precio) <= 0) nuevos.precio = 'Precio inválido'
    if (!datos.fecha) nuevos.fecha = 'Falta la fecha y hora'
    setErrores(nuevos)
    return Object.keys(nuevos).length === 0
  }

  function manejarEnvio(e) {
    e.preventDefault()
    if (!validar()) return

    const producto = productos.find((p) => p.id === datos.productoId)
    const cantidad = Number(datos.cantidad)
    const precio = Number(datos.precio)

    onRegistrar({
      // El id lo genera la base de datos automáticamente.
      producto: producto ? producto.nombre : 'Producto',
      cantidad,
      precio,
      total: Math.round(cantidad * precio * 100) / 100,
      metodo: datos.metodo,
      fecha: new Date(datos.fecha).toISOString(),
    })

    // Reinicia el formulario con la hora actual.
    setDatos(estadoInicial())
  }

  return (
    <form className="card form" onSubmit={manejarEnvio} noValidate>
      <h2 className="card__title">📝 Registrar venta</h2>

      <div className="form__group">
        <label className="form__label" htmlFor="producto">Producto</label>
        <select
          id="producto"
          className={`form__control ${errores.productoId ? 'is-error' : ''}`}
          value={datos.productoId}
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
            value={datos.cantidad}
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
            value={datos.precio}
            onChange={(e) => actualizar('precio', e.target.value)}
          />
          {errores.precio && <span className="form__error">{errores.precio}</span>}
        </div>
      </div>

      <div className="form__group">
        <span className="form__label">Método de pago</span>
        <div className="pago">
          <label className={`pago__opcion ${datos.metodo === 'Efectivo' ? 'is-active' : ''}`}>
            <input
              type="radio"
              name="metodo"
              value="Efectivo"
              checked={datos.metodo === 'Efectivo'}
              onChange={(e) => actualizar('metodo', e.target.value)}
            />
            💵 Efectivo
          </label>
          <label className={`pago__opcion ${datos.metodo === 'Mercado Pago' ? 'is-active' : ''}`}>
            <input
              type="radio"
              name="metodo"
              value="Mercado Pago"
              checked={datos.metodo === 'Mercado Pago'}
              onChange={(e) => actualizar('metodo', e.target.value)}
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
          value={datos.fecha}
          onChange={(e) => actualizar('fecha', e.target.value)}
        />
        {errores.fecha && <span className="form__error">{errores.fecha}</span>}
      </div>

      <button type="submit" className="btn btn--primary btn--block">
        ➕ Registrar venta
      </button>
    </form>
  )
}
