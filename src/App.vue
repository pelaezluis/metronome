<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <LoginScreen v-if="!isAuthenticated" @login="handleLogin" />
    <MainApp v-else :current-band="currentBand" @logout="handleLogout" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LoginScreen from './components/LoginScreen.vue'
import MainApp from './components/MainApp.vue'

const isAuthenticated = ref(false)
const currentBand = ref(null)

onMounted(() => {
  // Verificar si hay una sesión activa
  const savedBand = localStorage.getItem('currentBand')
  if (savedBand) {
    try {
      currentBand.value = JSON.parse(savedBand)
      isAuthenticated.value = true
    } catch (e) {
      console.error('Error al cargar sesión:', e)
      localStorage.removeItem('currentBand')
    }
  }
})

const handleLogin = (band) => {
  currentBand.value = band
  isAuthenticated.value = true
  localStorage.setItem('currentBand', JSON.stringify(band))
}

const handleLogout = () => {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    currentBand.value = null
    isAuthenticated.value = false
    localStorage.removeItem('currentBand')
  }
}
</script>


