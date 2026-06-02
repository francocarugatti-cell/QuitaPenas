import { useState, useMemo } from 'react'
import Sidebar from './components/Sidebar.jsx'
import SaleForm from './components/SaleForm.jsx'
import DaySummary from './components/DaySummary.jsx'
import SalesTable from './components/SalesTable.jsx'
import MonthlyChart from './components/MonthlyChart.jsx'
import History from './components/History.jsx'
import ProductManager from './components/ProductManager.jsx'
import Toast from './components/Toast.jsx'
import ConfirmDialog from './components/ConfirmDialog.jsx'
import SetupNotice from './components/SetupNotice.jsx'
import Login from './components/Login.jsx'
import { useCollection } from './hooks/useCollection.js'
import { supabase, supabaseConfigurado } from './lib/supabase.js'
import { todayKey, dateKey, formatFechaLarga, formatMoney } from './utils/format.js'
import { calcularResumen } from './utils/resumen.js'

// Títulos que se muestran en la barra superior de cada vista.
const TITULOS = {
  ventas: 'Registro de ventas',
  productos: 'Productos y precios',
  resumen: 'Resumen y reportes',
}

const CLAVE_SESION = 'qp_sesion'

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

  const [vista, setVista] = useState('ventas')
  const [toast, setToast] = useState(null)
  const [aEliminar, setAEliminar] = useState(null)

  // Ventas de hoy.
  const ventasHoy = useMemo(() => {
    const hoy = todayKey()
    return ventas.filter((v) => dateKey(v.fecha) === hoy)
  }, [ventas])

  const totalHoy = useMemo(() => calcularResumen(ventasHoy).total, [ventasHoy])

  // Muestra un toast temporal.
  function mostrarToast(mensaje, tipo = 'exito') {
    setToast({ mensaje, tipo })
    window.clearTimeout(mostrarToast._t)
    mostrarToast._t = window.setTimeout(() => setToast(null), 2800)
  }

  // ----- Operaciones sobre ventas -----
  async function registrarVenta(venta) {
    const { error } = await supabase.from('ventas').insert(venta)
    if (error) {
      mostrarToast('❌ No se pudo registrar la venta', 'error')
      return
    }
    await recargarVentas()
    mostrarToast('✅ Venta registrada correctamente')
  }

  async function confirmarEliminar() {
    const { error } = await supabase.from('ventas').delete().eq('id', aEliminar)
    setAEliminar(null)
    if (error) {
      mostrarToast('❌ No se pudo eliminar', 'error')
      return
    }
    await recargarVentas()
    mostrarToast('🗑️ Venta eliminada', 'error')
  }

  // ----- Operaciones sobre productos -----
  async function agregarProducto(nombre, precio) {
    const { error } = await supabase.from('productos').insert({ nombre, precio })
    if (error) return mostrarToast('❌ No se pudo agregar el producto', 'error')
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

  return (
    <div className="layout">
      <Sidebar vista={vista} setVista={setVista} onLogout={onLogout} />

      <main className="main">
        <div className="topbar">
          <div className="topbar__info">
            <h1 className="topbar__titulo">{TITULOS[vista]}</h1>
            <p className="topbar__fecha">{formatFechaLarga(new Date())}</p>
          </div>
          <div className="topbar__total">
            <span className="topbar__total-label">Total de hoy</span>
            <span className="topbar__total-valor">{formatMoney(totalHoy)}</span>
          </div>
        </div>

        <div className="contenido">
          {vista === 'ventas' && (
            <>
              <SaleForm productos={productos} onRegistrar={registrarVenta} />
              <section>
                <h2 className="seccion__titulo">🧾 Ventas de hoy</h2>
                <SalesTable ventas={ventasHoy} onEliminar={(id) => setAEliminar(id)} />
              </section>
            </>
          )}

          {vista === 'productos' && (
            <ProductManager
              productos={productos}
              onAgregar={agregarProducto}
              onCambiarPrecio={cambiarPrecioProducto}
              onBorrar={borrarProducto}
              embedded
            />
          )}

          {vista === 'resumen' && (
            <>
              <section>
                <h2 className="seccion__titulo">💰 Resumen de hoy</h2>
                <DaySummary ventas={ventasHoy} />
              </section>
              <MonthlyChart ventas={ventas} />
              <History ventas={ventas} />
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
          mensaje="¿Seguro que querés eliminar esta venta? Esta acción no se puede deshacer."
          onConfirmar={confirmarEliminar}
          onCancelar={() => setAEliminar(null)}
        />
      )}
    </div>
  )
}
