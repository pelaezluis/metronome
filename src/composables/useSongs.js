import { ref, computed } from "vue";
import supabase from "../config/supabase";

export function useSongs(bandId) {
  const songs = ref([]);
  const loading = ref(false);
  const searchFilter = ref("");

  const getStorageKey = () => `songs_${bandId}`;

  const saveToLocalStorage = (songsData) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(songsData));
    } catch (err) {
      // ...existing code...
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(getStorageKey());
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (err) {
      // console.error("Error al cargar desde localStorage:", err);
    }
    return [];
  };

  const filteredSongs = computed(() => {
    let filtered = songs.value;

    if (searchFilter.value.trim() !== "") {
      const searchTerm = searchFilter.value.toLowerCase().trim();
      filtered = filtered.filter((song) =>
        song.name.toLowerCase().includes(searchTerm)
      );
    }

    return [...filtered].sort((a, b) =>
      a.name.localeCompare(b.name, "es", { sensitivity: "base" })
    );
  });

  const loadSongs = async () => {
    if (!bandId) {
      songs.value = [];
      return;
    }

    loading.value = true;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("songs")
          .select("*")
          .eq("band_id", bandId)
          .order("name", { ascending: true });

        if (!error && data) {
          songs.value = data || [];
          saveToLocalStorage(songs.value);
          return;
        }
      } catch (err) {
        // ...existing code...
      }
    }

    const localSongs = loadFromLocalStorage();
    songs.value = localSongs;
    loading.value = false;
  };

  const saveSong = async (song) => {
    if (!bandId) {
      // console.error("No hay banda autenticada");
      return false;
    }

    const tempId = `temp_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const newSong = {
      id: tempId,
      name: song.name,
      bpm: song.bpm,
      compas: song.compas || song.timeSignature,
      band_id: bandId,
      created_at: new Date().toISOString(),
      _pendingSync: true,
    };

    songs.value.push(newSong);
    saveToLocalStorage(songs.value);

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("songs")
          .insert([
            {
              name: song.name,
              bpm: song.bpm,
              compas: song.compas || song.timeSignature,
              band_id: bandId,
            },
          ])
          .select()
          .single();

        if (!error && data) {
          const index = songs.value.findIndex((s) => s.id === tempId);
          if (index !== -1) {
            songs.value[index] = { ...data, _pendingSync: false };
            saveToLocalStorage(songs.value);
          }
          return true;
        }
      } catch (err) {
        // ...existing code...
        return true;
      }
    }

    return true;
  };

  const updateSong = async (songId, songData) => {
    if (!bandId) {
      return false;
    }

    if (!songData || !songData.name || !songData.bpm || !songData.compas) {
      return false;
    }

    if (songData.bpm < 30 || songData.bpm > 300) {
      return false;
    }

    try {
      const { data, error } = await supabase
        .from("songs")
        .update({ ...songData })
        .eq("id", songId)
        .select()
        .single();

      if (!error && data) {
        const index = songs.value.findIndex((s) => s.id === songId);
        if (index !== -1) {
          songs.value[index] = data;
          saveToLocalStorage(songs.value);
        }
        return true;
      }
    } catch (err) {
      return false;
    }

    return false;
  };

  const deleteSong = async (songId) => {
    if (!bandId) {
      // console.error("No hay banda autenticada");
      return false;
    }

    const songIndex = songs.value.findIndex((s) => s.id === songId);
    if (songIndex !== -1) {
      songs.value.splice(songIndex, 1);
      saveToLocalStorage(songs.value);
    }

    if (supabase && !songId.startsWith("temp_")) {
      try {
        const { error } = await supabase
          .from("songs")
          .delete()
          .eq("id", songId)
          .eq("band_id", bandId);

        if (error) {
          // ...existing code...
        }
      } catch (err) {
        // ...existing code...
      }
    }

    return true;
  };

  const syncPendingSongs = async () => {
    if (!supabase || !bandId) return;

    const pendingSongs = songs.value.filter(
      (s) => s._pendingSync && s.id.startsWith("temp_")
    );

    for (const song of pendingSongs) {
      try {
        const { data, error } = await supabase
          .from("songs")
          .insert([
            {
              name: song.name,
              bpm: song.bpm,
              compas: song.compas,
              band_id: bandId,
            },
          ])
          .select()
          .single();

        if (!error && data) {
          const index = songs.value.findIndex((s) => s.id === song.id);
          if (index !== -1) {
            songs.value[index] = { ...data, _pendingSync: false };
          }
        }
      } catch (err) {
        // ...existing code...
      }
    }

    saveToLocalStorage(songs.value);

    if (pendingSongs.length > 0) {
      await loadSongs();
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("online", () => {
      syncPendingSongs();
    });
  }

  return {
    songs,
    loading,
    searchFilter,
    filteredSongs,
    loadSongs,
    saveSong,
    updateSong,
    deleteSong,
    syncPendingSongs,
  };
}
