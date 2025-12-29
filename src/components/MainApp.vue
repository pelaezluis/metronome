<template>
  <div class="py-4 md:py-8 px-3 md:px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <header class="text-center mb-6 md:mb-8">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-3xl md:text-4xl font-bold text-indigo-800">Metrónomo</h1>
          <button @click="handleLogout"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm md:text-base">
            Cerrar Sesión
          </button>
        </div>
        <p class="text-sm md:text-base text-gray-600 px-2">Gestiona tus canciones y practica con el metrónomo</p>
        <p class="text-sm text-indigo-600 mt-2 font-medium">Banda: {{ capitalizeFirst(currentBand.name) }}</p>
      </header>

      <!-- Formulario para agregar/editar canciones -->
      <div class="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6 md:mb-8">
        <h2 class="text-xl md:text-2xl font-semibold text-gray-800 mb-4">
          {{ editingSong ? 'Editar Canción' : 'Agregar Nueva Canción' }}
        </h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="songName" class="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la Canción
            </label>
            <input v-model="form.name" type="text" id="songName" required
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
              placeholder="Ej: Canción en Do Mayor">
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="bpm" class="block text-sm font-medium text-gray-700 mb-1">
                BPM
              </label>
              <input v-model.number="form.bpm" type="number" id="bpm" required min="30" max="300"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
                placeholder="120">
            </div>

            <div>
              <label for="timeSignature" class="block text-sm font-medium text-gray-700 mb-1">
                Compás
              </label>
              <select v-model="form.timeSignature" id="timeSignature" required
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base">
                <option value="2/4">2/4</option>
                <option value="3/4">3/4</option>
                <option value="4/4">4/4</option>
                <option value="5/4">5/4</option>
                <option value="6/8">6/8</option>
                <option value="7/8">7/8</option>
                <option value="9/8">9/8</option>
                <option value="12/8">12/8</option>
              </select>
            </div>
          </div>

          <div class="flex gap-3">
            <button type="submit"
              class="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-200 font-medium text-base">
              {{ editingSong ? 'Guardar Cambios' : 'Agregar Canción' }}
            </button>
            <button v-if="editingSong" type="button" @click="cancelEdit"
              class="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200 font-medium text-base">
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <!-- Lista de canciones -->
      <div class="bg-white rounded-lg shadow-lg p-4 md:p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl md:text-2xl font-semibold text-gray-800">Mis Canciones</h2>
        </div>

        <!-- Campo de búsqueda -->
        <div class="mb-4">
          <label for="searchInput" class="block text-sm font-medium text-gray-700 mb-2">
            Buscar canción
          </label>
          <div class="relative">
            <input v-model="searchFilter" type="text" id="searchInput"
              class="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
              placeholder="Buscar por nombre o grupo...">
            <svg class="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
        
        <!-- Opción de acento en primer tiempo (único para todas las canciones) -->
        <div class="mb-4">
          <label class="flex items-center gap-3 cursor-pointer p-3 rounded-lg border-2 transition-all duration-200"
            :class="accentFirstBeat 
              ? 'bg-indigo-50 border-indigo-500 shadow-md' 
              : 'bg-gray-50 border-gray-300 hover:border-gray-400'">
            <div class="relative">
              <input 
                type="checkbox" 
                v-model="accentFirstBeat"
                @change="saveAccentPreference"
                class="sr-only"
              >
              <div class="w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-200"
                :class="accentFirstBeat 
                  ? 'bg-indigo-600 border-indigo-600' 
                  : 'bg-white border-gray-400'">
                <svg v-if="accentFirstBeat" class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
            <div class="flex items-center gap-2 flex-1">
              <span class="text-lg">🎵</span>
              <span class="text-base font-semibold" :class="accentFirstBeat ? 'text-indigo-700' : 'text-gray-700'">
                Acento en primer tiempo
              </span>
            </div>
            <div v-if="accentFirstBeat" class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
              Activo
            </div>
          </label>
        </div>

        <!-- Lista de canciones -->
        <div v-if="filteredSongs.length > 0" class="space-y-3">
          <div v-for="song in filteredSongs" :key="song.id"
            class="flex flex-col md:flex-row md:items-center md:justify-between p-3 md:p-4 border border-gray-200 rounded-lg shadow-md bg-white hover:bg-gray-50 transition gap-3">
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-gray-800 text-base md:text-lg truncate">{{ song.name }}</h3>
              <p class="text-xs md:text-sm text-gray-600 mt-1">
                {{ song.bpm }} BPM • Compás {{ song.compas || song.time_signature || song.timeSignature }}
              </p>
            </div>
            <div class="flex items-center gap-2 md:space-x-2 flex-shrink-0">
              <button @click="isPlaying && currentSong?.id === song.id ? stopMetronome() : playMetronome(song)" :class="[
                'flex-1 md:flex-none px-3 md:px-4 py-2 rounded-lg transition font-medium text-sm md:text-base border-2 text-gray-700 hover:text-gray-900',
                isPlaying && currentSong?.id === song.id
                  ? 'border-red-500 hover:border-red-600'
                  : 'border-green-500 hover:border-green-600'
              ]">
                <span v-if="isPlaying && currentSong?.id === song.id">⏸ Detener</span>
                <span v-else>▶ Play</span>
              </button>
              <button @click="handleEdit(song)"
                class="px-3 md:px-4 py-2 border-2 border-blue-500 text-gray-700 rounded-lg hover:border-blue-600 hover:text-gray-900 transition text-sm md:text-base"
                aria-label="Editar canción" title="Editar canción">
                ✏️
              </button>
              <button @click="handleDelete(song.id)"
                class="px-3 md:px-4 py-2 border-2 border-red-500 text-gray-700 rounded-lg hover:border-red-600 hover:text-gray-900 transition text-sm md:text-base"
                aria-label="Eliminar canción">
                🗑️
              </button>
            </div>
          </div>
        </div>

        <!-- Estados vacíos -->
        <div v-else-if="!loading && songs.length === 0"
          class="text-center py-8 text-gray-500 text-sm md:text-base px-2">
          <p>No hay canciones registradas. Agrega una canción para comenzar.</p>
        </div>
        <div v-else-if="!loading && searchFilter.trim() !== ''"
          class="text-center py-8 text-gray-500 text-sm md:text-base px-2">
          <p>No se encontraron canciones que coincidan con tu búsqueda.</p>
        </div>
        <div v-if="loading" class="text-center py-8 text-gray-500">
          <p>Cargando canciones...</p>
        </div>
      </div>

      <!-- Indicador de metrónomo activo -->
      <MetronomeIndicator v-if="isPlaying" :song="currentSong" @stop="stopMetronome" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useSongs } from '../composables/useSongs'
import { useMetronome } from '../composables/useMetronome'
import MetronomeIndicator from './MetronomeIndicator.vue'

const props = defineProps({
  currentBand: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['logout'])

// Formulario
const form = reactive({
  name: '',
  bpm: 120,
  timeSignature: '4/4'
})

// Estado de edición
const editingSong = ref(null)

// Composable de canciones
const { songs, loading, searchFilter, filteredSongs, loadSongs, saveSong, updateSong, deleteSong } = useSongs(props.currentBand.id)

// Opción de acento en primer tiempo (cargar desde localStorage)
const accentFirstBeat = ref(true) // Por defecto activado

// Cargar preferencia desde localStorage
onMounted(() => {
  loadSongs()
  const saved = localStorage.getItem('metronome_accent_first_beat')
  if (saved !== null) {
    accentFirstBeat.value = saved === 'true'
  }
})

// Guardar preferencia en localStorage
const saveAccentPreference = () => {
  localStorage.setItem('metronome_accent_first_beat', accentFirstBeat.value.toString())
}

// Composable de metrónomo
const { isPlaying, currentSong, play, stop } = useMetronome()

// Manejar submit del formulario
const handleSubmit = async (e) => {
  // Prevenir comportamiento por defecto explícitamente
  if (e) {
    e.preventDefault()
  }

  if (!form.name || !form.bpm || !form.timeSignature) {
    return
  }

  if (form.bpm < 30 || form.bpm > 300) {
    return
  }
  let success = false

  if (editingSong.value) {
    // Editar canción existente
    const songId = editingSong.value.id

    success = await updateSong(songId, {
      name: form.name.trim(),
      bpm: form.bpm,
      compas: form.timeSignature
    })
  } else {
    // Agregar nueva canción
    success = await saveSong({
      name: form.name.trim(),
      bpm: form.bpm,
      compas: form.timeSignature
    })
  }

  if (success) {
    // Limpiar formulario
    form.name = ''
    form.bpm = 120
    form.timeSignature = '4/4'
    editingSong.value = null
  }
}

// Manejar edición
const handleEdit = (song) => {
  // Crear una copia del objeto para evitar referencias
  editingSong.value = { ...song }
  form.name = song.name
  form.bpm = song.bpm
  form.timeSignature = song.compas || song.time_signature || song.timeSignature || '4/4'

  // Scroll al formulario
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Cancelar edición
const cancelEdit = () => {
  editingSong.value = null
  form.name = ''
  form.bpm = 120
  form.timeSignature = '4/4'
}

// Manejar eliminación
const handleDelete = async (songId) => {
  if (confirm('¿Estás seguro de que deseas eliminar esta canción?')) {
    await deleteSong(songId)
  }
}

// Reproducir metrónomo
const playMetronome = (song) => {
  play(song, accentFirstBeat.value)
}

// Detener metrónomo
const stopMetronome = () => {
  stop()
}

// Cerrar sesión
const handleLogout = () => {
  stop()
  emit('logout')
}

// Capitalizar primera letra
const capitalizeFirst = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
</script>
