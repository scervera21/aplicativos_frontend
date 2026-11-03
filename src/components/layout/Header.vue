<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { ArrowLeftOnRectangleIcon, UserCircleIcon } from '@heroicons/vue/24/outline';
import Swal from 'sweetalert2';

const router = useRouter();
const authStore = useAuthStore();

// Obtener los datos del usuario autenticado desde el store
const currentUser = computed(() => authStore.user);

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
  <header class="app-header">
    <!-- Saludo / Bienvenida al Usuario -->
    <div class="flex items-center gap-3">
      <UserCircleIcon class="h-8 w-8 text-[#81299A]" />
      <div>
        <h2 class="text-sm font-bold text-[#032C49]">
          Bienvenido, {{ currentUser?.username || 'Usuario' }}
        </h2>
        <p class="text-xs text-gray-500">
          {{ currentUser?.roles?.[0] || 'Colaborador' }}
        </p>
      </div>
    </div>

    <!-- Acciones del Header (Cerrar Sesión) -->
    <div class="flex items-center gap-4">
      <button
        @click="handleLogout"
        class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
        title="Cerrar sesión"
      >
        <ArrowLeftOnRectangleIcon class="h-5 w-5" />
        <span class="hidden sm:inline">Salir</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
/* Los estilos base del header ya están integrados en _header.scss */
</style>