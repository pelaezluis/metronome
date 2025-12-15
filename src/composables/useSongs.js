import { ref, computed } from 'vue'
import supabase from '../config/supabase'

export function useSongs(bandId) {
  const songs = ref([])
  const loading = ref(false)
  const searchFilter = ref('')

  // Clave para localStorage
  const getStorageKey = () => `songs_${bandId}`

  // Guardar canciones en localStorage
  const saveToLocalStorage = (songsData) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(songsData))
    } catch (err) {
      console.error('Error al guardar en localStorage:', err)
    }
  }

  // Cargar canciones desde localStorage
  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(getStorageKey())
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (err) {
      console.error('Error al cargar desde localStorage:', err)
    }
    return []
  }

  // Canciones filtradas y ordenadas
  const filteredSongs = computed(() => {
    let filtered = songs.value

    // Filtrar por búsqueda
    if (searchFilter.value.trim() !== '') {
      const searchTerm = searchFilter.value.toLowerCase().trim()
      filtered = filtered.filter(song =>
        song.name.toLowerCase().includes(searchTerm)
      )
    }

    // Ordenar alfabéticamente
    return [...filtered].sort((a, b) =>
      a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
    )
  })

  // Cargar canciones desde Supabase o localStorage
  const loadSongs = async () => {
    if (!bandId) {
      songs.value = []
      return
    }

    loading.value = true
    
    // Primero intentar cargar desde Supabase si hay conexión
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('songs')
          .select('*')
          .eq('band_id', bandId)
          .order('name', { ascending: true })

        if (!error && data) {
          songs.value = data || []
          // Guardar en localStorage después de cargar desde Supabase
          saveToLocalStorage(songs.value)
          return
        }
      } catch (err) {
        console.warn('No se pudo cargar desde Supabase, usando localStorage:', err)
      }
    }

    // Si no hay conexión o falló, cargar desde localStorage
    const localSongs = loadFromLocalStorage()
    songs.value = localSongs
    loading.value = false
  }

  // Guardar nueva canción
  const saveSong = async (song) => {
    if (!bandId) {
      console.error('No hay banda autenticada')
      return false
    }

    // Crear ID temporal para canciones sin conexión
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newSong = {
      id: tempId,
      name: song.name,
      bpm: song.bpm,
      compas: song.compas || song.timeSignature,
      band_id: bandId,
      created_at: new Date().toISOString(),
      _pendingSync: true // Marcar como pendiente de sincronización
    }

    // Guardar inmediatamente en localStorage
    songs.value.push(newSong)
    saveToLocalStorage(songs.value)

    // Intentar guardar en Supabase si hay conexión
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('songs')
          .insert([
            {
              name: song.name,
              bpm: song.bpm,
              compas: song.compas || song.timeSignature,
              band_id: bandId
            }
          ])
          .select()
          .single()

        if (!error && data) {
          // Reemplazar la canción temporal con la real
          const index = songs.value.findIndex(s => s.id === tempId)
          if (index !== -1) {
            songs.value[index] = { ...data, _pendingSync: false }
            saveToLocalStorage(songs.value)
          }
          return true
        }
      } catch (err) {
        console.warn('No se pudo guardar en Supabase, guardado solo en localStorage:', err)
        // La canción ya está guardada en localStorage, continuar
        return true
      }
    }

    // Si no hay conexión, la canción ya está guardada en localStorage
    return true
  }

  // Eliminar canción
  const deleteSong = async (songId) => {
    if (!bandId) {
      console.error('No hay banda autenticada')
      return false
    }

    // Eliminar inmediatamente de localStorage
    const songIndex = songs.value.findIndex(s => s.id === songId)
    if (songIndex !== -1) {
      songs.value.splice(songIndex, 1)
      saveToLocalStorage(songs.value)
    }

    // Intentar eliminar de Supabase si hay conexión y no es un ID temporal
    if (supabase && !songId.startsWith('temp_')) {
      try {
        const { error } = await supabase
          .from('songs')
          .delete()
          .eq('id', songId)
          .eq('band_id', bandId)

        if (error) {
          console.warn('No se pudo eliminar de Supabase, eliminado solo de localStorage:', error)
        }
      } catch (err) {
        console.warn('No se pudo eliminar de Supabase, eliminado solo de localStorage:', err)
      }
    }

    return true
  }

  // Sincronizar canciones pendientes con Supabase
  const syncPendingSongs = async () => {
    if (!supabase || !bandId) return

    const pendingSongs = songs.value.filter(s => s._pendingSync && s.id.startsWith('temp_'))
    
    for (const song of pendingSongs) {
      try {
        const { data, error } = await supabase
          .from('songs')
          .insert([
            {
              name: song.name,
              bpm: song.bpm,
              compas: song.compas,
              band_id: bandId
            }
          ])
          .select()
          .single()

        if (!error && data) {
          // Reemplazar la canción temporal con la real
          const index = songs.value.findIndex(s => s.id === song.id)
          if (index !== -1) {
            songs.value[index] = { ...data, _pendingSync: false }
          }
        }
      } catch (err) {
        console.warn('Error al sincronizar canción:', err)
      }
    }

    // Guardar estado actualizado
    saveToLocalStorage(songs.value)
    
    // Recargar desde Supabase para asegurar sincronización completa
    if (pendingSongs.length > 0) {
      await loadSongs()
    }
  }

  // Detectar cuando vuelve la conexión y sincronizar
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      console.log('Conexión restaurada, sincronizando...')
      syncPendingSongs()
    })
  }

  return {
    songs,
    loading,
    searchFilter,
    filteredSongs,
    loadSongs,
    saveSong,
    deleteSong,
    syncPendingSongs
  }
}

