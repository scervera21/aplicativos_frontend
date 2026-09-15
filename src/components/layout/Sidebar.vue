<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();

</script>

<template>
  <aside class="w-64 bg-slate-800/95 border-r border-slate-700/80 flex flex-col shrink-0">

    <!-- Enlaces de navegación -->
    <nav class="flex-1 p-3 space-y-1.5 overflow-y-auto">
      <router-link
        to="/dashboard"
        class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-slate-300 hover:text-white hover:bg-slate-700/60 transition-all duration-150"
        active-class="bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 !font-semibold shadow-sm"
      >
        <span class="text-base">📊</span>
        <span>Dashboard</span>
      </router-link>

      <!-- Filtrado dinámico según Spatie Access Permissions -->
      <router-link
        v-if="authStore.hasAccess('aplicativos')"
        to="/aplicativos"
        class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-slate-300 hover:text-white hover:bg-slate-700/60 transition-all duration-150"
        active-class="bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 !font-semibold shadow-sm"
      >
        <span class="text-base">🗂</span>
        <span>Aplicativos</span>
      </router-link>

      <router-link
        v-if="authStore.hasAccess('usuarios')"
        to="/users"
        class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-slate-300 hover:text-white hover:bg-slate-700/60 transition-all duration-150"
        active-class="bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 !font-semibold shadow-sm"
      >
        <span class="text-base">👥</span>
        <span>Usuarios</span>
      </router-link>

      <router-link
        v-if="authStore.hasAccess('roles')"
        to="/roles"
        class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-slate-300 hover:text-white hover:bg-slate-700/60 transition-all duration-150"
        active-class="bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 !font-semibold shadow-sm"
      >
        <span class="text-base">🛡️</span>
        <span>Roles y Permisos</span>
      </router-link>
    </nav>
  </aside>
</template>