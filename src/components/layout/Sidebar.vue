<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import {
  HomeIcon,
  UsersIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  ComputerDesktopIcon,
  ClipboardDocumentListIcon
} from '@heroicons/vue/24/outline';

const authStore = useAuthStore();

// Definición de los elementos del menú con sus respectivos permisos requeridos
const menuItems = computed(() => [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: HomeIcon,
    show: true // Todos los usuarios autenticados pueden ver el dashboard
  },
  {
    name: 'Usuarios',
    path: '/usuarios',
    icon: UsersIcon,
    permission: 'ver.usuarios'
  },
  {
    name: 'Roles y Permisos',
    path: '/roles',
    icon: ShieldCheckIcon,
    permission: 'ver.roles'
  },
  {
    name: 'Gerencias',
    path: '/gerencias',
    icon: BuildingOfficeIcon,
    permission: 'ver.gerencias'
  },
  {
    name: 'Aplicativos',
    path: '/aplicativos',
    icon: ComputerDesktopIcon,
    permission: 'ver.aplicativos'
  },
  {
    name: 'Actividades',
    path: '/actividades',
    icon: ClipboardDocumentListIcon,
    permission: 'ver.actividades'
  },
  {
    name: 'Project Manager',
    path: '/project-manager',
    icon: ClipboardDocumentListIcon,
    permission: 'gestionar.actividades'
  }
]);

// Filtrar elementos según los permisos del usuario actual
const filteredMenu = computed(() => {
  return menuItems.value.filter(item => {
    if (item.show) return true;
    if (item.permission) {
      return authStore.hasPermission(item.permission);
    }
    return false;
  });
});
</script>

<template>
  <aside class="app-sidebar">
    <!-- Logotipo / Título de la Aplicación -->
    <div class="h-16 flex items-center px-6 border-b border-[#032C49]/40 bg-[#032C49]">
      <span class="text-lg font-bold tracking-wider text-white">
        Gestión <span class="text-[#BDCEE5]">Aplicativos</span>
      </span>
    </div>

    <!-- Navegación Lateral -->
    <nav class="flex-1 py-4 space-y-1 overflow-y-auto">
      <RouterLink
        v-for="item in filteredMenu"
        :key="item.path"
        :to="item.path"
        class="sidebar-link"
      >
        <component :is="item.icon" class="h-5 w-5 shrink-0" />
        <span class="text-sm font-medium">{{ item.name }}</span>
      </RouterLink>
    </nav>

    <!-- Pie del Sidebar con Versión o Info Institucional -->
    <div class="p-4 border-t border-[#032C49]/40 text-xs text-[#BDCEE5] text-center">
      v1.0 • COINSE
    </div>
  </aside>
</template>

<style scoped>
/* Los estilos base y los estados activos ya están respaldados en _sidebar.scss */
</style>