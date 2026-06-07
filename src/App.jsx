import { useState, useMemo } from 'react'
import Sidebar from './components/Sidebar.jsx'
import SaleForm from './components/SaleForm.jsx'
import DaySummary from './components/DaySummary.jsx'
import SalesTable from './components/SalesTable.jsx'
import MonthlyChart from './components/MonthlyChart.jsx'
import History from './components/History.jsx'
import GeneralSummary from './components/GeneralSummary.jsx'
import ProductManager from './components/ProductManager.jsx'
import Toast from './components/Toast.jsx'
import ConfirmDialog from './components/ConfirmDialog.jsx'
import SetupNotice from './components/SetupNotice.jsx'
import Login from './components/Login.jsx'
import { useCollection } from './hooks/useCollection.js'
import { supabase, supabaseConfigurado } from './lib/supabase.js'
import { todayKey, dateKey, formatFechaLarga, formatMoney } from './utils/format.js'
import { calcularResumen } from './utils/resumen.js'
import { NEGOCIO_DEFECTO, negocioPorId } from './utils/negocios.js'

// Títulos que se muestran en la barra superior de cada vista.
const TITULOS = {
  ventas: 'Registro de ventas',
  productos: 'Productos y precios',
  resumen: 'Resumen y reportes',
}

const CLAVE_SESION = 'qp_sesion'
const CLAVE_NEGOCIO = 'qp_negocio'

export default function App() {
  // Estado de sesión, recordado en el navegador.
  const [autenticado, setAutenticado] = useState(
    () => window.localStorage.getItem(CLAVE_SESION) === '1',
  )

  // Si todavía no se conectó la base de datos, mostramos las instrucciones.
  if (!supabaseConfigurado) {
    return <SetupNotice />
  }

  // Si no inició sesión, mostramos la pantalla de acceso.
  if (!autenticado) {
    return (
      <Login
        onLogin={() => {
          window.localStorage.setItem(CLAVE_SESION, '1')
          setAutenticado(true)
        }}
      />
    )
  }

  return (
    <AppConectada
      onLogout={() => {
        window.localStorage.removeItem(CLAVE_SESION)
        setAutenticado(false)
      }}
    />
  )
}

function AppConectada({ onLogout }) {
  // Datos en la nube, sincronizados en tiempo real entre dispositivos.
  const { rows: ventas, recargar: recargarVentas } = useCollection('ventas', {
    columna: 'fecha',
    ascendente: false,
  })
  const { rows: productos, recargar: recargarProductos } = useCollection('productos', {
    columna: 'creado_en',
    ascendente: true,
  })

  // Negocio (canal) activo, recordado en el navegador.
  const [negocio, setNegocio] = useState(
    () => window.localStorage.getItem(CLAVE_NEGOCIO) || NEGOCIO_DEFECTO,
  )
  const [general, setGeneral] = useState(false) // Resumen general (los 3 negocios).
  const [vista, setVista] = useState('ventas')
  const [toast, setToast] = useState(null)
  const [aEliminar, setAEliminar] = useState(null)

  // Elegir un negocio sale del resumen general.
  function cambiarNegocio(id) {
    window.localStorage.setItem(CLAVE_NEGOCIO, id)
    setNegocio(id)
    setGeneral(false)
  }

  // Solo los productos y ventas del negocio activo (las filas viejas sin
  // canal se consideran de la panadería).
  const productosCanal = useMemo(
    () => productos.filter((p) => (p.canal || NEGOCIO_DEFECTO) === negocio),
    [productos, negocio],
  )
  const ventasCanal = useMemo(
    () => ventas.filter((v) => (v.canal || NEGOCIO_DEFECTO) === negocio),
    [ventas, negocio],
  )

  // Ventas de hoy (del negocio activo).
  const ventasHoy = useMemo(() => {
    const hoy = todayKey()
    return ventasCanal.filter((v) => dateKey(v.fecha) === hoy)
  }, [ventasCanal])

  const totalHoy = useMemo(() => calcularResumen(ventasHoy).total, [ventasHoy])

  // Muestra un toast temporal.
  function mostrarToast(mensaje, tipo = 'exito') {
    setToast({ mensaje, tipo })
    window.clearTimeout(mostrarToast._t)
    mostrarToast._t = window.setTimeout(() => setToast(null), 2800)
  }

  // ----- Operaciones sobre ventas -----
  // Registra un cliente: todos sus productos comparten un mismo "ticket".
  async function registrarCliente({ items, metodo, fecha, cliente }) {
    if (!items || items.length === 0) return
    const ticket = crypto.randomUUID()
    const filas = items.map((it) => ({ ...it, metodo, fecha, ticket, cliente, canal: negocio }))

    const { error } = await supabase.from('ventas').insert(filas)
    if (error) {
      console.error('Error al registrar cliente:', error)
      mostrarToast(`❌ ${error.message}`, 'error')
      return
    }
    await recargarVentas()
    mostrarToast('✅ Cliente registrado correctamente')
  }

  async function confirmarEliminar() {
    // aEliminar es la lista de ids de los productos del cliente.
    const { error } = await supabase.from('ventas').delete().in('id', aEliminar)
    setAEliminar(null)
    if (error) {
      mostrarToast('❌ No se pudo eliminar', 'error')
      return
    }
    await recargarVentas()
    mostrarToast('🗑️ Cliente eliminado', 'error')
  }

  // ----- Operaciones sobre productos -----
  async function agregarProducto(nombre, precio) {
    const { error } = await supabase.from('productos').insert({ nombre, precio, canal: negocio })
    if (error) {
      console.error('Error al agregar producto:', error)
      return mostrarToast(`❌ ${error.message}`, 'error')
    }
    await recargarProductos()
    mostrarToast('✅ Producto agregado')
  }

  async function cambiarPrecioProducto(id, precio) {
    const { error } = await supabase.from('productos').update({ precio }).eq('id', id)
    if (error) return mostrarToast('❌ No se pudo actualizar el precio', 'error')
    await recargarProductos()
    mostrarToast('✅ Precio actualizado')
  }

  async function borrarProducto(id) {
    const { error } = await supabase.from('productos').delete().eq('id', id)
    if (error) return mostrarToast('❌ No se pudo borrar el producto', 'error')
    await recargarProductos()
    mostrarToast('🗑️ Producto borrado', 'error')
  }

  const datosNegocio = negocioPorId(negocio)

  return (
    <div className={`layout tema-${negocio}`}>
      <Sidebar
        negocio={negocio}
        setNegocio={cambiarNegocio}
        general={general}
        setGeneral={() => setGeneral(true)}
        vista={vista}
        setVista={setVista}
        onLogout={onLogout}
      />

      <main className="main">
        <div className="topbar">
          <div className="topbar__info">
            <span className="topbar__negocio">
              {general ? '📈 Todos los negocios' : `${datosNegocio.icono} ${datosNegocio.label}`}
            </span>
            <h1 className="topbar__titulo">
              {general ? 'Resumen general' : TITULOS[vista]}
            </h1>
            <p className="topbar__fecha">{formatFechaLarga(new Date())}</p>
          </div>
          {!general && (
            <div className="topbar__total">
              <span className="topbar__total-label">Total de hoy</span>
              <span className="topbar__total-valor">{formatMoney(totalHoy)}</span>
            </div>
          )}
        </div>

        <div className="contenido">
          {general && <GeneralSummary ventas={ventas} />}

          {!general && vista === 'ventas' && (
            <>
              <SaleForm
                productos={productosCanal}
                onRegistrar={registrarCliente}
                conNombre={negocio !== NEGOCIO_DEFECTO}
              />
              <section>
                <h2 className="seccion__titulo">🧾 Clientes de hoy</h2>
                <SalesTable ventas={ventasHoy} onEliminar={(ids) => setAEliminar(ids)} />
              </section>
            </>
          )}

          {!general && vista === 'productos' && (
            <ProductManager
              productos={productosCanal}
              onAgregar={agregarProducto}
              onCambiarPrecio={cambiarPrecioProducto}
              onBorrar={borrarProducto}
              embedded
            />
          )}

          {!general && vista === 'resumen' && (
            <>
              <section>
                <h2 className="seccion__titulo">💰 Resumen de hoy</h2>
                <DaySummary ventas={ventasHoy} />
              </section>
              <MonthlyChart ventas={ventasCanal} />
              <History ventas={ventasCanal} />
            </>
          )}

          <footer className="footer">
            Hecho con 🥐 para Quita Penas · Datos sincronizados en la nube ☁️
          </footer>
        </div>
      </main>

      {toast && <Toast tipo={toast.tipo}>{toast.mensaje}</Toast>}

      {aEliminar && (
        <ConfirmDialog
          mensaje="¿Seguro que querés eliminar este cliente y todos sus productos? Esta acción no se puede deshacer."
          onConfirmar={confirmarEliminar}
          onCancelar={() => setAEliminar(null)}
        />
      )}
    </div>
  )
}
