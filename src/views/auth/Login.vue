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
  isLoading.value = true;
  const success = await authStore.login(form);
  isLoading.value = false;

  if (success) {
    Swal.fire({
      icon: 'success',
      title: '¡Bienvenido!',
      text: 'Sesión iniciada correctamente.',
      timer: 1500,
      showConfirmButton: false,
    });
    router.push({ name: 'dashboard' });
  } else {
    Swal.fire('Error', 'Credenciales incorrectas.', 'error');
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-900 px-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
      <h2 class="text-3xl font-bold text-center text-slate-800 mb-2">Gestion de Aplicativos</h2>
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Usuario de red</label>
          <input
            v-model="form.username"
            type="username"
            required
            class="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Contraseña</label>
          <input
            v-model="form.password"
            type="password"
            required
            class="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition duration-200"
        >
          {{ isLoading ? 'Iniciando Sesión...' : 'Iniciar Sesión' }}
        </button>
      </form>
    </div>
  </div>
</template>