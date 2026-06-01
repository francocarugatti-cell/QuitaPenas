import { createClient } from '@supabase/supabase-js'

// Credenciales del proyecto Supabase. Se leen desde variables de entorno
// (archivo .env.local en desarrollo, o variables del proyecto en Vercel).
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Indica si la app ya tiene credenciales para conectarse a la base de datos.
export const supabaseConfigurado = Boolean(url && anonKey)

// Cliente de Supabase (null si todavía no se configuró).
export const supabase = supabaseConfigurado ? createClient(url, anonKey) : null
