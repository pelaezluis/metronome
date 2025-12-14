import { createClient } from '@supabase/supabase-js'

// Obtener credenciales desde variables de entorno de Vite
// Vite expone las variables de entorno con el prefijo VITE_ en import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

let supabase = null

// Verificar si las variables están configuradas
const hasUrl = supabaseUrl && supabaseUrl !== '' && supabaseUrl !== 'https://tu-proyecto.supabase.co'
const hasKey = supabaseAnonKey && supabaseAnonKey !== '' && supabaseAnonKey !== 'tu_anon_key_aqui'

if (hasUrl && hasKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
  console.log('✅ Supabase configurado correctamente')
} else {
  console.error('❌ Las credenciales de Supabase no están configuradas correctamente.')
  console.error('')
  console.error('Para solucionarlo:')
  console.error('1. Crea un archivo .env en la raíz del proyecto')
  console.error('2. Agrega las siguientes líneas:')
  console.error('   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co')
  console.error('   VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui')
  console.error('3. Reemplaza los valores con tus credenciales reales de Supabase')
  console.error('4. Reinicia el servidor de desarrollo (npm run dev)')
  console.error('')
  if (!hasUrl) {
    console.error('   ⚠️ VITE_SUPABASE_URL no está configurado o tiene un valor por defecto')
  }
  if (!hasKey) {
    console.error('   ⚠️ VITE_SUPABASE_ANON_KEY no está configurado o tiene un valor por defecto')
  }
}

export default supabase

