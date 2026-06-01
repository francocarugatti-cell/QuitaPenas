import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'

/**
 * Carga una tabla de Supabase y se mantiene sincronizada en tiempo real:
 * cuando otro dispositivo agrega/edita/borra un registro, esta lista se
 * actualiza sola.
 * @param {string} tabla   Nombre de la tabla ('ventas' | 'productos').
 * @param {object} orden   Orden de la consulta { columna, ascendente }.
 */
export function useCollection(tabla, orden = { columna: 'creado_en', ascendente: true }) {
  const [rows, setRows] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const recargar = useCallback(async () => {
    if (!supabase) return
    const { data, error } = await supabase
      .from(tabla)
      .select('*')
      .order(orden.columna, { ascending: orden.ascendente })

    if (error) {
      setError(error.message)
    } else {
      setRows(data || [])
      setError(null)
    }
    setCargando(false)
  }, [tabla, orden.columna, orden.ascendente])

  useEffect(() => {
    if (!supabase) {
      setCargando(false)
      return
    }

    recargar()

    // Suscripción en tiempo real a cualquier cambio en la tabla.
    const canal = supabase
      .channel(`realtime:${tabla}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tabla }, recargar)
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [tabla, recargar])

  return { rows, cargando, error, recargar }
}
