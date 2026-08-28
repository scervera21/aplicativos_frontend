<!-- frontend/src/components/layout/Sidebar.vue -->
<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore';
import { computed } from 'vue';

const authStore = useAuthStore();
const accessPermissions = computed(() => authStore.permissions.access);
</script>

<template>
  <aside class="w-64 bg-slate-800 text-slate-200 min-h-screen p-4">
    <nav class="space-y-2">
      <router-link to="/dashboard" class="block px-4 py-2 rounded hover:bg-slate-700">
        📊 Dashboard
      </router-link>

      <!-- Filtrado dinámico según Spatie access permissions -->
      <router-link
        v-if="accessPermissions.includes('acceder_aplicativos')"
        to="/aplicativos"
        class="block px-4 py-2 rounded hover:bg-slate-700"
      >
        🗂 Aplicativos
      </router-link>

      <router-link
        v-if="accessPermissions.includes('acceder_usuarios')"
        to="/users"
        class="block px-4 py-2 rounded hover:bg-slate-700"
      >
        👥 Usuarios
      </router-link>

      <router-link
        v-if="accessPermissions.includes('acceder_roles')"
        to="/roles"
        class="block px-4 py-2 rounded hover:bg-slate-700"
      >
        🛡️ Roles y Permisos
      </router-link>
    </nav>
  </aside>
</template>