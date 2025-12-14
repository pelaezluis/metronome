import { ref, computed } from 'vue'
import supabase from '../config/supabase'

export function useSongs(bandId) {
  const songs = ref([])
  const loading = ref(false)
  const searchFilter = ref('')

  // Canciones filtradas y ordenadas
  const filteredSongs = computed(() => {
    let filtered = songs.value

    // Filtrar por búsqueda
    if (searchFilter.value.trim() !== '') {
      const searchTerm = searchFilter.value.toLowerCase().trim()
      filtered = filtered.filter(song =>
        song.name.toLowerCase().includes(searchTerm) ||
        (song.group && song.group.toLowerCase().includes(searchTerm))
      )
    }

    // Ordenar alfabéticamente
    return [...filtered].sort((a, b) =>
      a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
    )
  })

  // Cargar canciones desde Supabase
  const loadSongs = async () => {
    if (!supabase || !bandId) {
      songs.value = []
      return
    }

    loading.value = true
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('band_id', bandId)
        .order('name', { ascending: true })

      if (error) {
        console.error('Error al cargar canciones:', error)
        songs.value = []
      } else {
        songs.value = data || []
      }
    } catch (err) {
      console.error('Error al cargar canciones:', err)
      songs.value = []
    } finally {
      loading.value = false
    }
  }

  // Guardar nueva canción
  const saveSong = async (song) => {
    if (!supabase || !bandId) {
      console.error('No hay conexión a Supabase o no hay banda autenticada')
      return false
    }

    try {
      const { data, error } = await supabase
        .from('songs')
        .insert([
          {
            name: song.name,
            group: song.group || null,
            bpm: song.bpm,
            time_signature: song.timeSignature,
            band_id: bandId
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Error al guardar canción:', error)
        alert('Error al guardar la canción. Por favor, intenta de nuevo.')
        return false
      }

      await loadSongs()
      return true
    } catch (err) {
      console.error('Error al guardar canción:', err)
      alert('Error al guardar la canción. Por favor, intenta de nuevo.')
      return false
    }
  }

  // Eliminar canción
  const deleteSong = async (songId) => {
    if (!supabase || !bandId) {
      console.error('No hay conexión a Supabase o no hay banda autenticada')
      return false
    }

    try {
      const { error } = await supabase
        .from('songs')
        .delete()
        .eq('id', songId)
        .eq('band_id', bandId)

      if (error) {
        console.error('Error al eliminar canción:', error)
        alert('Error al eliminar la canción. Por favor, intenta de nuevo.')
        return false
      }

      await loadSongs()
      return true
    } catch (err) {
      console.error('Error al eliminar canción:', err)
      alert('Error al eliminar la canción. Por favor, intenta de nuevo.')
      return false
    }
  }

  return {
    songs,
    loading,
    searchFilter,
    filteredSongs,
    loadSongs,
    saveSong,
    deleteSong
  }
}

