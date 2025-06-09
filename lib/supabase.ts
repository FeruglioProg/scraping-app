import { createClient } from "@supabase/supabase-js"

// Verificar que las variables de entorno estén disponibles
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Validar que las credenciales existan
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ Faltan variables de entorno de Supabase. Verifica tu configuración.")
}

// Cliente para el frontend (con RLS)
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!)

// Cliente para el backend (sin RLS, para operaciones administrativas)
export const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey || supabaseAnonKey!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Función para probar la conexión
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from("properties").select("count", { count: "exact", head: true })

    if (error) throw error

    return { success: true, message: "Conexión exitosa a Supabase" }
  } catch (error) {
    console.error("Error al conectar con Supabase:", error)
    return { success: false, message: error.message || "Error desconocido" }
  }
}
