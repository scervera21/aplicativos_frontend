<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import {
  ArrowLeftOnRectangleIcon,
  UserCircleIcon,
  BellIcon,
  MagnifyingGlassIcon
} from '@heroicons/vue/24/outline';
import Swal from 'sweetalert2';

const router = useRouter();
const authStore = useAuthStore();

// Obtener los datos del usuario autenticado desde el store
const currentUser = computed(() => authStore.user);
const primaryRole = computed(() => authStore.roles[0] || 'Colaborador');

// Manejador del cierre de sesión
const handleLogout = async () => {
  const result = await Swal.fire({
    title: '¿Cerrar sesión?',
    text: '¿Estás seguro de que deseas salir del sistema?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#81299A',
    cancelButtonColor: '#032C49',
    confirmButtonText: 'Sí, salir',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    await authStore.logout();
    router.push({ name: 'Login' });
    
    Swal.fire({
      icon: 'success',
      title: 'Sesión finalizada',
      text: 'Has salido correctamente del sistema.',
      timer: 1500,
      showConfirmButton: false
    });
  }
};
</script>

<template>
  <header class="app-header px-6 py-3.5 bg-white border-b border-[#BDCEE5]/50 flex items-center justify-end shadow-2xs">
    <!-- Acciones y Perfil del Usuario alineados a la derecha -->
    <div class="flex items-center gap-4">
      <!-- Notificaciones -->
      <!-- <button
        class="relative p-2 rounded-xl text-gray-500 hover:text-[#032C49] hover:bg-[#F4F1FA] transition-colors cursor-pointer"
        title="Notificaciones"
      >
        <BellIcon class="h-5 w-5" />
        <span class="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#81299A] ring-2 ring-white" />
      </button> -->

      <!-- <div class="h-6 w-px bg-[#BDCEE5]/50 hidden sm:block" /> -->

      <!-- Saludo / Bienvenida al Usuario -->
      <div class="flex items-center gap-3">
        <div class="p-1 rounded-full bg-[#F4F1FA] text-[#81299A]">
          <UserCircleIcon class="h-8 w-8" />
        </div>
        <div class="hidden sm:block text-left">
          <h2 class="text-xs font-bold text-[#032C49] leading-tight">
            {{ currentUser?.username || 'Usuario' }}
          </h2>
          <p class="text-[11px] text-gray-500 capitalize leading-tight">
            {{ primaryRole }}
          </p>
        </div>
      </div>

      <!-- Acciones del Header (Cerrar Sesión) -->
      <button
        @click="handleLogout"
        class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
        title="Cerrar sesión"
      >
        <ArrowLeftOnRectangleIcon class="h-4 w-4" />
        <span class="hidden md:inline">Salir</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
/* Los estilos estructurales macro están respaldados en _header.scss */
</style>