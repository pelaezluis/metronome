<template>
  <div class="fixed bottom-4 left-4 right-4 md:bottom-8 md:left-auto md:right-8 md:w-auto bg-indigo-600 text-white rounded-lg md:rounded-full p-3 md:p-4 shadow-lg z-50">
    <div class="flex items-center justify-between md:justify-start space-x-3">
      <div class="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
        <div 
          :class="['w-3 h-3 md:w-4 md:h-4 bg-white rounded-full flex-shrink-0', { 'beat-animation': isBeating }]"
        ></div>
        <span class="font-medium text-sm md:text-base truncate">
          {{ song.name }} - {{ song.bpm }} BPM ({{ song.time_signature || song.timeSignature }})
        </span>
      </div>
      <button 
        @click="$emit('stop')"
        class="px-3 py-1.5 md:py-1 bg-white text-indigo-600 rounded hover:bg-gray-100 text-sm md:text-base font-medium flex-shrink-0"
      >
        Detener
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  song: {
    type: Object,
    required: true
  }
})

defineEmits(['stop'])

const isBeating = ref(false)
let beatInterval = null

onMounted(() => {
  // Calcular intervalo de beats para la animación
  const intervalMs = (60 / props.song.bpm) * 1000
  
  beatInterval = setInterval(() => {
    isBeating.value = true
    setTimeout(() => {
      isBeating.value = false
    }, 100)
  }, intervalMs)
})

onUnmounted(() => {
  if (beatInterval) {
    clearInterval(beatInterval)
  }
})
</script>

