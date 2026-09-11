<script setup lang="ts">
  import { RouterView } from 'vue-router';
  import { useAuthStore } from './stores/authStore';
  import { ref } from 'vue';
  import Sidebar from './components/layout/Sidebar.vue';

  const authStore = useAuthStore()
  const sidebarVisible = ref(false)

  const toggleSidebar = () => {
    sidebarVisible.value = !sidebarVisible.value
  }

</script>

<template>
  <div id="app" class="min-h-screen bg-slate-900 text-slate-100 antialiased font-sans">
    <Sidebar v-if="authStore.isAuthenticated" :visible="sidebarVisible" @toggle="toggleSidebar" />
    <RouterView /> <!-- Este componente se encarga de renderizar la vista actual -->
  </div>
</template>

<style>
  #app {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    min-height: 100vh;
  }
</style>
