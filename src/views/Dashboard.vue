<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { UserCircleIcon, EnvelopeIcon, ShieldCheckIcon } from '@heroicons/vue/24/outline';

const authStore = useAuthStore();
const currentUser = computed(() => authStore.user);
const userRoles = computed(() => authStore.roles);
const userPermissions = computed(() => authStore.permissions);
</script>

<template>
  <div class="space-y-6">
    <!-- Encabezado de Bienvenida -->
    <div class="bg-white p-6 rounded-xl shadow-sm border border-[#BDCEE5]/40 flex items-center gap-4">
      <div class="p-3 bg-[#F4F1FA] rounded-full text-[#81299A]">
        <UserCircleIcon class="h-12 w-12" />
      </div>
      <div>
        <h1 class="text-2xl font-bold text-[#032C49]">
          ¡Bienvenido de nuevo, {{ currentUser?.username || 'Usuario' }}!
        </h1>
        <p class="text-sm text-gray-500">
          Has iniciado sesión correctamente en el Sistema de Gestión y Seguimiento de Aplicativos.
        </p>
      </div>
    </div>

    <!-- Tarjetas de Información del Perfil -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <!-- Datos Personales / Cuenta -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-[#BDCEE5]/40 space-y-4">
        <h3 class="text-lg font-bold text-[#032C49] border-b pb-2 flex items-center gap-2">
          <UserCircleIcon class="h-5 w-5 text-[#81299A]" />
          Información de la Cuenta
        </h3>
        
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="font-semibold text-gray-600">Nombre de Usuario:</span>
            <span class="text-[#032C49] font-medium">{{ currentUser?.username }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="font-semibold text-gray-600 flex items-center gap-1">
              <EnvelopeIcon class="h-4 w-4 text-gray-400" /> Correo:
            </span>
            <span class="text-[#032C49]">{{ currentUser?.email }}</span>
          </div>
        </div>
      </div>

      <!-- Roles Asignados (Spatie) -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-[#BDCEE5]/40 space-y-4">
        <h3 class="text-lg font-bold text-[#032C49] border-b pb-2 flex items-center gap-2">
          <ShieldCheckIcon class="h-5 w-5 text-[#81299A]" />
          Roles Asignados
        </h3>
        
        <div class="flex flex-wrap gap-2">
          <span
            v-for="role in userRoles"
            :key="role"
            class="px-3 py-1 bg-[#F4F1FA] text-[#81299A] border border-[#81299A]/30 rounded-full text-xs font-semibold"
          >
            {{ role }}
          </span>
          <span v-if="!userRoles.length" class="text-sm text-gray-400 italic">
            Sin roles asignados
          </span>
        </div>
      </div>

    </div>

    <!-- Permisos del Sistema -->
    <div class="bg-white p-6 rounded-xl shadow-sm border border-[#BDCEE5]/40 space-y-4">
      <h3 class="text-lg font-bold text-[#032C49] border-b pb-2">
        Permisos Activos en tu Sesión
      </h3>
      <div class="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-[#F4F1FA]/40 rounded-lg">
        <span
          v-for="permission in userPermissions"
          :key="permission"
          class="px-2.5 py-1 bg-white text-[#032C49] border border-[#BDCEE5] rounded text-xs font-mono shadow-xs"
        >
          {{ permission }}
        </span>
        <span v-if="!userPermissions.length" class="text-sm text-gray-400 italic">
          No hay permisos registrados en el token.
        </span>
      </div>
    </div>

  </div>
</template>