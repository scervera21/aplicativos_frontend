<script setup lang="ts">
import { ref } from 'vue'
import apiClient from '@/plugins/axios'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const loggingOut = ref(false)
const testingAction = ref(false)
const testResult = ref<string | null>(null)

const handleLogout = async () => {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    loggingOut.value = true
    await authStore.logout()
    loggingOut.value = false
  }
}

const testRefresh = async () => {
  testingAction.value = true
  testResult.value = null
  try {
    const response = await apiClient.post('/v1/auth/refresh')
    authStore.saveNewToken(response.data.token, response.data.expires_in)
    testResult.value = JSON.stringify(response.data, null, 2)
    alert('¡Token renovado con éxito desde Laravel!')
  } catch (error) {
    console.error('Fallo en prueba de refresh:', error)
  } finally {
    testingAction.value = false
  }
}

const testMe = async () => {
  testingAction.value = true
  testResult.value = null
  try {
    const response = await apiClient.get('/v1/auth/me')
    testResult.value = JSON.stringify(response.data, null, 2)
    alert(`¡Perfil verificado: ${response.data.first_name} ${response.data.last_name}!`)
  } catch (error) {
    console.error('Fallo en consulta de perfil:', error)
  } finally {
    testingAction.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
    <!-- Barra Superior de Navegación -->
    <header class="bg-slate-800 border-b border-slate-700 sticky top-0 z-10 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <!-- Logo y Nombre del Sistema -->
        <div class="flex items-center gap-3">
          <div class="h-9 w-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/20">
            <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <span class="font-bold text-lg text-white">Sistema de Gestion de Aplicativos</span>
        </div>

        <!-- Usuario Autenticado y Botón de Salir -->
        <div class="flex items-center gap-4">
          <div class="text-right hidden sm:block">
            <p class="text-sm font-semibold text-white">
              {{ authStore.user?.first_name }} {{ authStore.user?.last_name }}
            </p>
            <p class="text-xs text-slate-400">@{{ authStore.user?.username }}</p>
          </div>

          <button
            @click="handleLogout"
            :disabled="loggingOut"
            class="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition duration-150"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>{{ loggingOut ? 'Cerrando...' : 'Cerrar Sesión' }}</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Contenido Principal -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <!-- Tarjeta de Bienvenida y Estado de Sesión -->
      <div class="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-extrabold text-white">
              ¡Bienvenido, {{ authStore.user?.first_name }}! 👋
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span class="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Sesión Activa
            </span>
            </h1>
          </div>
        </div>
      </div>

      <!-- Cuadrícula de Información -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Tarjeta: Datos del Usuario -->
        <div class="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl space-y-4">
          <h2 class="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
            <svg class="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Información de la Cuenta
          </h2>

          <div class="space-y-3 text-sm">
            <div class="flex justify-between py-1 border-b border-slate-700/50">
              <span class="text-slate-400">ID:</span>
              <span class="font-mono font-semibold text-white">#{{ authStore.user?.id }}</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-700/50">
              <span class="text-slate-400">Nombre Completo:</span>
              <span class="font-semibold text-white">{{ authStore.user?.first_name }} {{ authStore.user?.last_name }}</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-700/50">
              <span class="text-slate-400">Nombre de Usuario:</span>
              <span class="font-mono text-indigo-300">@{{ authStore.user?.username }}</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-700/50">
              <span class="text-slate-400">Correo Electrónico:</span>
              <span class="text-white">{{ authStore.user?.email }}</span>
            </div>
            <div class="flex justify-between py-1">
              <span class="text-slate-400">Estatus:</span>
              <span v-if="authStore.user?.status" class="text-emerald-400 font-semibold">Activo</span>
              <span v-else class="text-red-400 font-semibold">Inactivo</span>
            </div>
          </div>
        </div>

        <!-- Tarjeta: Roles y Permisos Spatie -->
        <div class="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl space-y-4">
          <h2 class="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
            <svg class="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Roles y Permisos (Spatie ACL)
          </h2>

          <!-- Lista de Roles -->
          <div>
            <p class="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">Roles Asignados:</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="role in authStore.user?.roles"
                :key="role.id"
                class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
              >
                {{ role.name }}
              </span>
              <span v-if="!authStore.user?.roles?.length" class="text-xs text-slate-500 italic">
                Sin roles asignados
              </span>
            </div>
          </div>

          <!-- Lista de Permisos -->
          <div class="pt-2">
            <p class="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">
              Permisos Calculados ({{ authStore.userPermissions.length }}):
            </p>
            <div class="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              <span
                v-for="perm in authStore.userPermissions"
                :key="perm"
                class="px-2 py-0.5 text-xs font-mono rounded bg-slate-900/60 text-slate-300 border border-slate-700"
              >
                {{ perm }}
              </span>
              <span v-if="!authStore.userPermissions.length" class="text-xs text-slate-500 italic">
                Sin permisos activos
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel de Pruebas de Endpoints de Laravel -->
      <div class="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl space-y-4">
        <h2 class="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
          <svg class="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Pruebas de Conexión con Laravel API
        </h2>

        <div class="flex flex-wrap gap-3">
          <button
            @click="testRefresh"
            :disabled="testingAction"
            class="px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition shadow-md shadow-indigo-600/20"
          >
            🔄 Probar Silent Refresh (/v1/auth/refresh)
          </button>

          <button
            @click="testMe"
            :disabled="testingAction"
            class="px-4 py-2 text-sm font-semibold rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 disabled:opacity-50 transition border border-slate-600"
          >
            👤 Consultar Perfil (/v1/auth/me)
          </button>
        </div>

        <div v-if="testResult" class="mt-4 p-4 rounded-xl bg-slate-900/80 border border-slate-700">
          <p class="text-xs uppercase font-bold text-slate-400 mb-1">Respuesta del Servidor:</p>
          <pre class="text-xs font-mono text-emerald-400 overflow-x-auto">{{ testResult }}</pre>
        </div>
      </div>
    </main>
  </div>
</template>