<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2'

const router = useRouter()
const authStore = useAuthStore();
const loggingOut = ref(false);

const handleLogout = async () => {
  const result = await Swal.fire({
    title: '¿Seguro?',
    text: 'Se finalizará la sesión actual.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Cerrar sesión',
    cancelButtonText: 'Volver'
  })

  if (result.isConfirmed) {
    loggingOut.value = true
    await authStore.logout()
    loggingOut.value = false

    Swal.fire({
      icon: 'success',
      title: 'Sesión cerrada',
      text: 'Has salido correctamente del sistema.',
      timer: 1500,
      showConfirmButton: false
    })

    router.push({ name: 'login' })
  }
}

</script>

<template>
  <!-- Encabezado superior de ancho completo (AppHeader) -->
  <header class="w-full bg-slate-800/95 backdrop-blur border-b border-slate-700/80 sticky top-0 z-30 shadow-md">
    <div class="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <!-- Marca / Nombre del sistema -->
      <div class="flex items-center gap-3">
        <div class="h-9 w-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/20">
          <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h1 class="font-bold text-xl sm:text-2xl text-white tracking-tight">Aplicativos GGSI</h1>
      </div>

      <!-- Sección Derecha: Usuario y Botón de Cerrar Sesión -->
      <div class="flex items-center gap-4">
        <div class="text-right hidden sm:block">
          <p class="text-sm font-semibold text-white leading-tight">
            {{ authStore.user?.first_name }} {{ authStore.user?.last_name }}
          </p>
          <p class="text-xs text-indigo-400 font-mono">@{{ authStore.user?.username }}</p>
        </div>

        <button
          @click="handleLogout"
          :disabled="loggingOut"
          class="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition duration-150 active:scale-95 disabled:opacity-50"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span class="hidden sm:inline">{{ loggingOut ? 'Cerrando...' : 'Cerrar Sesión' }}</span>
        </button>
      </div>
    </div>
  </header>
</template>