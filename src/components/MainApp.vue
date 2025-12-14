<template>
  <div class="py-4 md:py-8 px-3 md:px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <header class="text-center mb-6 md:mb-8">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-3xl md:text-4xl font-bold text-indigo-800">Metrónomo</h1>
          <button 
            @click="handleLogout"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm md:text-base"
          >
            Cerrar Sesión
          </button>
        </div>
        <p class="text-sm md:text-base text-gray-600 px-2">Gestiona tus canciones y practica con el metrónomo</p>
        <p class="text-sm text-indigo-600 mt-2 font-medium">Banda: {{ currentBand.name }}</p>
      </header>

      <!-- Formulario para agregar canciones -->
      <div class="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6 md:mb-8">
        <h2 class="text-xl md:text-2xl font-semibold text-gray-800 mb-4">Agregar Nueva Canción</h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="songName" class="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la Canción
            </label>
            <input 
              v-model="form.name"
              type="text" 
              id="songName" 
              required
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
              placeholder="Ej: Canción en Do Mayor"
            >
          </div>
          
          <div>
            <label for="group" class="block text-sm font-medium text-gray-700 mb-1">
              Grupo (Tu banda)
            </label>
            <input 
              v-model="form.group"
              type="text" 
              id="group" 
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
              placeholder="Ej: Banda de Jazz, Orquesta, etc."
            >
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="bpm" class="block text-sm font-medium text-gray-700 mb-1">
                BPM
              </label>
              <input 
                v-model.number="form.bpm"
                type="number" 
                id="bpm" 
                required
                min="30"
                max="300"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
                placeholder="120"
              >
            </div>
            
            <div>
              <label for="timeSignature" class="block text-sm font-medium text-gray-700 mb-1">
                Compás
              </label>
              <select 
                v-model="form.timeSignature"
                id="timeSignature" 
                required
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
              >
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
          
          <button 
            type="submit"
            class="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-200 font-medium text-base"
          >
            Agregar Canción
          </button>
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
            <input 
              v-model="searchFilter"
              type="text" 
              id="searchInput"
              class="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
              placeholder="Buscar por nombre o grupo..."
            >
            <svg class="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
        
        <!-- Lista de canciones -->
        <div v-if="filteredSongs.length > 0" class="space-y-3">
          <div 
            v-for="song in filteredSongs" 
            :key="song.id"
            class="flex flex-col md:flex-row md:items-center md:justify-between p-3 md:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition gap-3"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="font-semibold text-gray-800 text-base md:text-lg truncate">{{ song.name }}</h3>
                <span 
                  v-if="song.group" 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                >
                  {{ song.group }}
                </span>
              </div>
              <p class="text-xs md:text-sm text-gray-600 mt-1">
                {{ song.bpm }} BPM • Compás {{ song.time_signature || song.timeSignature }}
              </p>
            </div>
            <div class="flex items-center gap-2 md:space-x-2 flex-shrink-0">
              <button 
                @click="playMetronome(song)"
                class="flex-1 md:flex-none px-3 md:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm md:text-base"
              >
                ▶ Play
              </button>
              <button 
                @click="handleDelete(song.id)"
                class="px-3 md:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm md:text-base"
                aria-label="Eliminar canción"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
        
        <!-- Estados vacíos -->
        <div v-else-if="!loading && songs.length === 0" class="text-center py-8 text-gray-500 text-sm md:text-base px-2">
          <p>No hay canciones registradas. Agrega una canción para comenzar.</p>
        </div>
        <div v-else-if="!loading && searchFilter.trim() !== ''" class="text-center py-8 text-gray-500 text-sm md:text-base px-2">
          <p>No se encontraron canciones que coincidan con tu búsqueda.</p>
        </div>
        <div v-if="loading" class="text-center py-8 text-gray-500">
          <p>Cargando canciones...</p>
        </div>
      </div>

      <!-- Indicador de metrónomo activo -->
      <MetronomeIndicator 
        v-if="isPlaying"
        :song="currentSong"
        @stop="stopMetronome"
      />
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
  group: '',
  bpm: 120,
  timeSignature: '4/4'
})

// Composable de canciones
const { songs, loading, searchFilter, filteredSongs, loadSongs, saveSong, deleteSong } = useSongs(props.currentBand.id)

// Composable de metrónomo
const { isPlaying, currentSong, play, stop } = useMetronome()

// Cargar canciones al montar
onMounted(() => {
  loadSongs()
})

// Manejar submit del formulario
const handleSubmit = async () => {
  if (!form.name || !form.bpm || !form.timeSignature) {
    return
  }

  if (form.bpm < 30 || form.bpm > 300) {
    alert('El BPM debe estar entre 30 y 300')
    return
  }

  const success = await saveSong({
    name: form.name.trim(),
    group: form.group.trim(),
    bpm: form.bpm,
    timeSignature: form.timeSignature
  })

  if (success) {
    // Limpiar formulario
    form.name = ''
    form.group = ''
    form.bpm = 120
    form.timeSignature = '4/4'
  }
}

// Manejar eliminación
const handleDelete = async (songId) => {
  if (confirm('¿Estás seguro de que deseas eliminar esta canción?')) {
    await deleteSong(songId)
  }
}

// Reproducir metrónomo
const playMetronome = (song) => {
  play(song)
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
</script>

