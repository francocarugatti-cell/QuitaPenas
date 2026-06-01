import { useState } from 'react'

/**
 * Gestor de productos: permite agregar, editar el precio y borrar productos.
 * Las operaciones se realizan contra la base de datos (callbacks del padre).
 * @param {Array} productos          Lista actual de productos { id, nombre, precio }.
 * @param {Function} onAgregar       (nombre, precio) => agrega un producto.
 * @param {Function} onCambiarPrecio (id, precio) => actualiza el precio.
 * @param {Function} onBorrar        (id) => borra el producto.
 * @param {boolean} embedded         Si es true se muestra siempre abierto (sin desplegable).
 */
export default function ProductManager({
  productos,
  onAgregar,
  onCambiarPrecio,
  onBorrar,
  embedded = false,
}) {
  const [abierto, setAbierto] = useState(embedded)
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState('')
  const [error, setError] = useState('')

  function agregar(e) {
    e.preventDefault()
    const nom = nombre.trim()
    if (!nom) {
      setError('Escribí un nombre')
      return
    }
    // Evita duplicados (sin distinguir mayúsculas).
    if (productos.some((p) => p.nombre.toLowerCase() === nom.toLowerCase())) {
      setError('Ese producto ya existe')
      return
    }
    const valor = Number(precio)
    if (!precio || valor < 0 || Number.isNaN(valor)) {
      setError('Precio inválido')
      return
    }

    onAgregar(nom, valor)
    setNombre('')
    setPrecio('')
    setError('')
  }

  // Confirma el nuevo precio al salir del campo (evita escribir en la base por cada tecla).
  function confirmarPrecio(producto, valor) {
    const nuevo = Number(valor)
    if (Number.isNaN(nuevo) || nuevo < 0 || nuevo === producto.precio) return
    onCambiarPrecio(producto.id, nuevo)
  }

  return (
    <section className={embedded ? 'card' : 'historial'}>
      {embedded ? (
        <h2 className="card__title">🥖 Gestionar productos y precios</h2>
      ) : (
        <button
          className="historial__toggle"
          onClick={() => setAbierto((v) => !v)}
          aria-expanded={abierto}
        >
          <span>🥖 Gestionar productos y precios</span>
          <span className={`historial__flecha ${abierto ? 'is-open' : ''}`}>▾</span>
        </button>
      )}

      {abierto && (
        <div className={embedded ? 'historial__contenido historial__contenido--embebido' : 'historial__contenido'}>
          {/* Lista editable de productos existentes */}
          <ul className="productos__lista">
            {productos.map((p) => (
              <li key={p.id} className="productos__item">
                <span className="productos__nombre">{p.nombre}</span>
                <div className="productos__precio">
                  <span className="productos__signo">$</span>
                  <input
                    key={`${p.id}-${p.precio}`}
                    type="number"
                    min="0"
                    step="0.01"
                    className="form__control productos__input"
                    defaultValue={p.precio}
                    onBlur={(e) => confirmarPrecio(p, e.target.value)}
                    aria-label={`Precio de ${p.nombre}`}
                  />
                </div>
                <button
                  className="btn btn--icono btn--peligro"
                  onClick={() => onBorrar(p.id)}
                  aria-label={`Borrar ${p.nombre}`}
                  title="Borrar producto"
                >
                  🗑️
                </button>
              </li>
            ))}
            {productos.length === 0 && (
              <li className="productos__vacio">No hay productos. Agregá uno abajo 👇</li>
            )}
          </ul>

          {/* Formulario para agregar un producto nuevo */}
          <form className="productos__nuevo" onSubmit={agregar}>
            <div className="form__group productos__nuevo-nombre">
              <label className="form__label" htmlFor="nuevo-nombre">Nuevo producto</label>
              <input
                id="nuevo-nombre"
                type="text"
                className="form__control"
                placeholder="Ej: Pan dulce"
                value={nombre}
                onChange={(e) => { setNombre(e.target.value); setError('') }}
              />
            </div>
            <div className="form__group productos__nuevo-precio">
              <label className="form__label" htmlFor="nuevo-precio">Precio ($)</label>
              <input
                id="nuevo-precio"
                type="number"
                min="0"
                step="0.01"
                className="form__control"
                placeholder="0,00"
                value={precio}
                onChange={(e) => { setPrecio(e.target.value); setError('') }}
              />
            </div>
            <button type="submit" className="btn btn--primary productos__agregar">
              ➕ Agregar
            </button>
          </form>
          {error && <span className="form__error">{error}</span>}

          <p className="productos__ayuda">
            💡 El precio que pongas acá se completa solo al elegir el producto en el
            formulario de venta (igual podés cambiarlo en cada venta). El precio se
            guarda al salir del campo. Total de productos: {productos.length}.
          </p>
        </div>
      )}
    </section>
  )
}
