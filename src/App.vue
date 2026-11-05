<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from '@/components/layout/Sidebar.vue';
import Header from '@/components/layout/Header.vue';

const route = useRoute();

// Determinar si la ruta actual es una página limpia (ej. Login) sin layout principal
const isAuthRoute = computed(() => route.meta.requiresGuest === true || route.name === 'Login');
</script>

<template>
  <!-- Vista para páginas de autenticación / públicas (sin Sidebar ni Header) -->
  <template v-if="isAuthRoute">
    <RouterView />
  </template>

  <!-- Layout principal para la aplicación autenticada -->
  <div v-else class="app-layout">
    <!-- Barra lateral de navegación con control de permisos -->
    <Sidebar />

    <!-- Contenedor derecho principal -->
    <div class="main-content">
      <!-- Encabezado superior con perfil y cierre de sesión -->
      <Header />

      <!-- Área dinámica donde se renderizan las vistas de los módulos -->
      <main class="flex-1 p-6 md:p-8 overflow-y-auto">
        <div class="max-w-7xl mx-auto w-full">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>