<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();

</script>

<template>

  <aside class="w-64 bg-slate-800 text-slate-200 min-h-screen p-4">
        <div class="flex items-center gap-3 p-2 mb-2">
          <div class="h-9 w-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/20">
            <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <span class="font-bold text-lg text-white">Menu principal</span>
        </div>
    <nav class="space-y-2">
      <router-link to="/dashboard" class="block px-4 py-2 rounded hover:bg-slate-700">
        📊 Dashboard
      </router-link>

      <!-- Filtrado dinámico según Spatie -->
      <router-link
        v-if="authStore.hasAccess('aplicativos')"
        to="/aplicativos"
        class="block px-4 py-2 rounded hover:bg-slate-700"
      >
        🗂 Aplicativos
      </router-link>

      <router-link
        v-if="authStore.hasAccess('usuarios')"
        to="/users"
        class="block px-4 py-2 rounded hover:bg-slate-700"
      >
        👥 Usuarios
      </router-link>

      <router-link
        to="/roles"
        class="block px-4 py-2 rounded hover:bg-slate-700"
      >
        🛡️ Roles y Permisos
      </router-link>
    </nav>
  </aside>
</template>