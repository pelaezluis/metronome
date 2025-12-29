import { ref, onUnmounted } from 'vue'

export function useMetronome() {
  const isPlaying = ref(false)
  const currentSong = ref(null)
  const audioContext = ref(null)
  const currentMetronome = ref(null)

  const initAudioContext = async () => {
    if (!audioContext.value) {
      audioContext.value = new (window.AudioContext || window.webkitAudioContext)()
    }
    // Asegurar que el AudioContext esté activo (resumir si está suspendido)
    if (audioContext.value.state === 'suspended') {
      await audioContext.value.resume()
    }
  }

  const playSound = (frequency, duration, isFirstBeat) => {
    if (!audioContext.value) return

    const currentTime = audioContext.value.currentTime

    // Generar tono brillante tipo campana/triángulo
    // Usar múltiples osciladores para crear un sonido más rico y brillante
    const masterGain = audioContext.value.createGain()
    masterGain.connect(audioContext.value.destination)
    
    // Oscilador principal con tipo triangle para sonido más brillante
    const oscillator = audioContext.value.createOscillator()
    const gainNode = audioContext.value.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(masterGain)
    
    oscillator.frequency.value = frequency
    oscillator.type = 'triangle' // Cambiar a triangle para sonido más brillante
    
    // Agregar armónicos para sonido tipo campana (más brillante)
    // Agregar un segundo oscilador con frecuencia más alta para brillo
    const harmonicOsc = audioContext.value.createOscillator()
    const harmonicGain = audioContext.value.createGain()
    
    harmonicOsc.connect(harmonicGain)
    harmonicGain.connect(masterGain)
    
    harmonicOsc.frequency.value = frequency * 2.5 // Armónico más alto para brillo
    harmonicOsc.type = 'triangle'
    
    // Volumen más bajo para el armónico
    harmonicGain.gain.setValueAtTime(0.15, currentTime)
    harmonicGain.gain.exponentialRampToValueAtTime(0.001, currentTime + duration * 0.8)
    
    harmonicOsc.start(currentTime)
    harmonicOsc.stop(currentTime + duration)
    
    // Configurar ganancia principal
    gainNode.gain.setValueAtTime(0.4, currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + duration)
    
    masterGain.gain.setValueAtTime(0.5, currentTime)
    
    oscillator.start(currentTime)
    oscillator.stop(currentTime + duration)
  }

  const play = async (song, accentFirstBeat = true) => {
    // Detener si hay uno activo
    stop()

    if (!song) return

    currentSong.value = song
    isPlaying.value = true
    
    // Inicializar y activar AudioContext antes de comenzar
    await initAudioContext()

    // Calcular intervalo en milisegundos
    const intervalMs = (60 / song.bpm) * 1000

    // Parsear compás (aceptar diferentes nombres de campo)
    const timeSig = song.compas || song.time_signature || song.timeSignature
    const [beatsPerMeasure] = timeSig.split('/').map(Number)

    let beatCount = 0

    const tick = () => {
      if (!isPlaying.value) return

      beatCount++

      // Determinar si es el primer beat del compás
      const isFirstBeat = (beatCount % beatsPerMeasure === 1) || beatCount === 1
      
      // Si accentFirstBeat está activado, el primer beat suena diferente (más fuerte)
      // Si está desactivado, todos los beats suenan con el sonido del acento (más fuerte)
      let frequency, duration
      if (accentFirstBeat) {
        // Acento activado: primer beat diferente, resto normal
        frequency = isFirstBeat ? 1000 : 600  // Frecuencias más altas para sonido brillante
        duration = isFirstBeat ? 0.15 : 0.08  // Duración un poco más larga
      } else {
        // Acento desactivado: todos los beats usan el sonido del acento
        frequency = 1000  // Frecuencia alta para sonido brillante
        duration = 0.15
      }

      // Reproducir sonido inmediatamente
      playSound(frequency, duration, isFirstBeat)

      // Programar siguiente tick
      currentMetronome.value = setTimeout(tick, intervalMs)
    }

    // Ejecutar el primer tick inmediatamente sin delay
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

