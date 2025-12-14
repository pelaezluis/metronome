import { ref, onUnmounted } from 'vue'

export function useMetronome() {
  const isPlaying = ref(false)
  const currentSong = ref(null)
  const audioContext = ref(null)
  const currentMetronome = ref(null)

  const initAudioContext = () => {
    if (!audioContext.value) {
      audioContext.value = new (window.AudioContext || window.webkitAudioContext)()
    }
  }

  const play = (song) => {
    // Detener si hay uno activo
    stop()

    if (!song) return

    currentSong.value = song
    isPlaying.value = true
    initAudioContext()

    // Calcular intervalo en milisegundos
    const intervalMs = (60 / song.bpm) * 1000

    // Parsear compás
    const timeSig = song.time_signature || song.timeSignature
    const [beatsPerMeasure] = timeSig.split('/').map(Number)

    let beatCount = 0

    const tick = () => {
      if (!isPlaying.value) return

      beatCount++

      // Sonido más fuerte en el primer beat del compás
      const isFirstBeat = (beatCount % beatsPerMeasure === 1) || beatCount === 1
      const frequency = isFirstBeat ? 800 : 400
      const duration = isFirstBeat ? 0.1 : 0.05

      // Generar tono
      const oscillator = audioContext.value.createOscillator()
      const gainNode = audioContext.value.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.value.destination)

      oscillator.frequency.value = frequency
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.3, audioContext.value.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.value.currentTime + duration)

      oscillator.start(audioContext.value.currentTime)
      oscillator.stop(audioContext.value.currentTime + duration)

      // Programar siguiente tick
      currentMetronome.value = setTimeout(tick, intervalMs)
    }

    tick()
  }

  const stop = () => {
    isPlaying.value = false
    if (currentMetronome.value) {
      clearTimeout(currentMetronome.value)
      currentMetronome.value = null
    }
    currentSong.value = null
  }

  // Limpiar al desmontar
  onUnmounted(() => {
    stop()
  })

  return {
    isPlaying,
    currentSong,
    play,
    stop
  }
}

