<!-- frontend/src/views/auth/LoginView.vue -->
<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import Swal from 'sweetalert2';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  username: '',
  password: '',
});

const isLoading = ref(false);

async function handleLogin() {

  if (!form.username || !form.password) return
  isLoading.value = true;

  try {
    await authStore.login(form);
    if(authStore.isAuthenticated) {
      Swal.fire({
        icon: 'success',
        title: `Inicio de sesión exitoso`,
        timer: 1500,
        showConfirmButton: false
      })
      router.push({ name: 'dashboard' });
    }
  } catch (error) {
    console.error('Fallo en autenticación:', error)
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center bg-gradient-to-r from-[#062b4f] via-[#051d36] to-[#3c2a5a] justify-center px-4">
    <div class="max-w-md w-full bg-white backdrop-blur-lg rounded-2xl shadow p-8 border-t border-gray-300 overflow-hidden">

      <!-- Encabezado -->
      <h2 class="text-3xl font-bold text-center text-slate-700 mb-4">Gestión de Aplicativos</h2>

      <!-- Formulario -->
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Usuario</label>
          <input
            v-model="form.username"
            type="text"
            required
            class="w-full px-4 py-3 rounded-lg border-2 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#265BC3] focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Contraseña</label>
          <input
            v-model="form.password"
            type="password"
            required
            class="w-full px-4 py-3 rounded-lg border-2 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#265BC3] focus:border-transparent outline-none"
            placeholder="••••••••"
          />
        </div>

        <!-- Botón de envio -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-3 bg-[#265BC3] hover:bg-[#2268C2] hover:shadow-lg hover:shadow-[#2268C2]/50 text-white font-semibold rounded-lg backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
        >
          {{ isLoading ? 'Ingresando...' : 'Iniciar Sesión' }}
        </button>
      </form>
    </div>
  </div>
</template>