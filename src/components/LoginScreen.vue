<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-xl p-8 md:p-10">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
            </svg>
          </div>
          <h1 class="text-3xl md:text-4xl font-bold text-indigo-800 mb-2">Metrónomo</h1>
          <p class="text-gray-600">Inicia sesión con tu banda</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label for="bandName" class="block text-sm font-semibold text-gray-700 mb-2">
              Banda
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <input 
                v-model="bandName"
                type="text" 
                id="bandName" 
                required
                autocomplete="username"
                class="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-base"
                placeholder="Nombre de tu banda"
              >
            </div>
          </div>
          
          <div>
            <label for="bandKey" class="block text-sm font-semibold text-gray-700 mb-2">
              Contraseña
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <input 
                v-model="bandKey"
                type="password" 
                id="bandKey" 
                required
                autocomplete="current-password"
                class="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-base"
                placeholder="Ingresa tu contraseña"
              >
            </div>
          </div>
          
          <div v-if="error" class="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
              </svg>
              <span>{{ error }}</span>
            </div>
          </div>
          
          <button 
            type="submit"
            :disabled="loading"
            class="w-full bg-indigo-600 text-white py-3.5 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 font-semibold text-base shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!loading">Iniciar Sesión</span>
            <span v-else class="flex items-center justify-center">
              Iniciando sesión...
              <svg class="animate-spin h-5 w-5 text-white ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
          </button>
        </form>
      </div>
      
      <p class="text-center text-gray-500 text-sm mt-6">
        Sistema de gestión de metrónomo para bandas
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import supabase from '../config/supabase'

const emit = defineEmits(['login'])

const bandName = ref('')
const bandKey = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  
  if (!bandName.value.trim() || !bandKey.value.trim()) {
    error.value = 'Por favor, completa todos los campos'
    return
  }
  
  if (!supabase) {
    error.value = 'Error: Supabase no está configurado. Por favor, configura las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el archivo .env'
    return
  }
  
  loading.value = true
  
  try {
    const trimmedBandName = bandName.value.trim()
    const trimmedBandKey = bandKey.value.trim()
    
    console.log('🔍 Intentando autenticar:', { 
      bandName: trimmedBandName, 
      bandKeyLength: trimmedBandKey.length 
    })
    
    // Usar maybeSingle() en lugar de single() para manejar mejor los casos sin resultados
    // o limit(1) para obtener solo el primer resultado si hay múltiples
    const { data: bandsData, error: dbError } = await supabase
      .from('bands')
      .select('*')
      .eq('band_name', trimmedBandName)
      .limit(1)
    
    // Mostrar error detallado si hay problema con la consulta
    if (dbError) {
      console.error('❌ Error de Supabase:', dbError)
      error.value = `Error al buscar la banda: ${dbError.message || 'Error desconocido'}`
      loading.value = false
      return
    }
    
    // Verificar si se encontró alguna banda
    if (!bandsData || bandsData.length === 0) {
      console.log('❌ No se encontró la banda:', trimmedBandName)
      error.value = 'Nombre de banda o contraseña incorrectos'
      loading.value = false
      return
    }
    
    // Si hay múltiples resultados, tomar el primero
    const bands = bandsData[0]
    
    if (bandsData.length > 1) {
      console.warn('⚠️ Se encontraron múltiples bandas con el mismo nombre, usando la primera')
    }
    
    // Mostrar TODOS los campos de la banda para depuración
    console.log('✅ Banda encontrada - TODOS los campos:')
    console.table(bands)
    console.log('📋 Campos disponibles:', Object.keys(bands))
    console.log('🔍 Contraseña ingresada (longitud):', trimmedBandKey.length, 'caracteres')
    
    // Excluir campos que definitivamente no son contraseñas
    const excludedFields = ['id', 'band_name', 'name', 'created_at', 'updated_at', 'email']
    
    // Obtener TODOS los campos que podrían ser la contraseña
    const allPossiblePasswordFields = Object.keys(bands).filter(
      field => !excludedFields.includes(field) && 
               bands[field] !== null && 
               bands[field] !== undefined
    )
    
    console.log('🔑 Campos que podrían ser la contraseña:', allPossiblePasswordFields)
    
    // También incluir campos comunes por si acaso
    const commonPasswordFields = ['key', 'password', 'pass', 'pwd', 'contraseña', 'band_key', 'band_password']
    const passwordFieldsToCheck = [...new Set([...commonPasswordFields, ...allPossiblePasswordFields])]
    
    let passwordMatch = false
    let passwordField = null
    
    console.log('🔍 Verificando campos:', passwordFieldsToCheck)
    
    for (const field of passwordFieldsToCheck) {
      if (bands[field] !== undefined && bands[field] !== null) {
        // Comparación con trim para evitar problemas con espacios
        const storedPassword = String(bands[field]).trim()
        const inputPassword = trimmedBandKey
        
        // Mostrar más información de depuración
        const match = storedPassword === inputPassword
        console.log(`🔑 Campo "${field}":`, {
          valorAlmacenado: storedPassword.length > 0 ? storedPassword.substring(0, Math.min(10, storedPassword.length)) + (storedPassword.length > 10 ? '...' : '') : '(vacío)',
          longitudAlmacenada: storedPassword.length,
          valorIngresado: inputPassword.length > 0 ? inputPassword.substring(0, Math.min(10, inputPassword.length)) + (inputPassword.length > 10 ? '...' : '') : '(vacío)',
          longitudIngresada: inputPassword.length,
          coinciden: match,
          tipoAlmacenado: typeof bands[field]
        })
        
        if (match) {
          passwordMatch = true
          passwordField = field
          console.log(`✅ ¡CONTRASEÑA CORRECTA! Campo usado: "${field}"`)
          break
        }
      } else {
        console.log(`⚠️ Campo "${field}" no existe o es null/undefined`)
      }
    }
    
    if (!passwordMatch) {
      console.error('❌ CONTRASEÑA INCORRECTA')
      console.error('📋 Resumen:')
      console.error('  - Campos verificados:', passwordFieldsToCheck)
      console.error('  - Contraseña ingresada:', trimmedBandKey.length, 'caracteres')
      console.error('  - Todos los campos de la banda:', Object.keys(bands))
      console.error('💡 SUGERENCIA: Revisa en la consola qué campos tiene tu tabla "bands" y qué valor tiene el campo de contraseña')
      error.value = 'Nombre de banda o contraseña incorrectos'
      loading.value = false
      return
    }
    
    console.log('✅ Contraseña correcta. Campo usado:', passwordField)
    
    // Autenticación exitosa
    const band = {
      id: bands.id,
      name: bands.band_name
    }
    
    emit('login', band)
    
  } catch (err) {
    console.error('❌ Error en autenticación:', err)
    error.value = `Error al iniciar sesión: ${err.message || 'Error desconocido'}`
  } finally {
    loading.value = false
  }
}
</script>

