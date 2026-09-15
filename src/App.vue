<script setup lang="ts">
  import { RouterView } from 'vue-router';
  import { useAuthStore } from './stores/authStore';
  import Sidebar from './components/layout/Sidebar.vue';
  import Header from './components/layout/Header.vue';

  const authStore = useAuthStore()
</script>

<template>
  <div id="app" class="min-h-screen flex flex-col bg-slate-900 text-slate-100 antialiased font-sans">
    <!-- Header superior de ancho completo -->
    <Header v-if="authStore.isAuthenticated" />

    <!-- Contenedor inferior: Sidebar lateral + Contenido dinámico (router-view) -->
    <div class="flex flex-1 overflow-hidden">
      <Sidebar v-if="authStore.isAuthenticated" />

      <!-- Área dinámica de las vistas con scroll independiente -->
      <div class="flex-1 overflow-y-auto">
        <RouterView />
      </div>
    </div>
  </div>
</template>
