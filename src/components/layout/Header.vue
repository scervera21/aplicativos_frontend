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
    title: '¿Cerrar sesión?',
    text: 'Se finalizará la sesión actual.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, cerrar sesión',
    cancelButtonText: 'Cancelar'
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
  <div class="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
    <!-- Barra Superior de Navegación -->
        <header class="bg-slate-800 border-b border-slate-700 sticky top-0 z-10 shadow-lg">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

                <!-- Usuario Autenticado y Botón de Salir -->
                <div class="flex items-center justify-between w-full gap-4">
                <div class="text-left hidden sm:block">
                    <p class="text-sm font-semibold text-white">
                    {{ authStore.user?.first_name }} {{ authStore.user?.last_name }}
                    </p>
                    <p class="text-xs text-slate-400">@{{ authStore.user?.username }}</p>
                </div>     
                
                <div class="flex">
                    <h1 class="font-bold text-2xl">Aplicativos GGSI</h1>
                </div>

                <button
                    @click="handleLogout"
                    :disabled="loggingOut"
                    class="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition duration-150"
                >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>{{ loggingOut ? 'Cerrando...' : 'Cerrar Sesión' }}</span>
                </button>
                </div>
            </div>
        </header>
  </div>
</template>