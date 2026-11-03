<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import Swal from 'sweetalert2';
import { UserIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline';

const router = useRouter();
const authStore = useAuthStore();

// Estados reactivos del formulario
const username = ref('');
const password = ref('');
const isLoading = ref(false);

  // Estado para controlar la visibilidad de la contraseña
  const showPassword = ref(false);

  const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value;
  };

/**
 * Manejador del evento de inicio de sesión
 */
const handleLogin = async () => {
  if (!username.value || !password.value) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos incompletos',
      text: 'Por favor, introduce tu correo y contraseña.',
      confirmButtonColor: '#81299A'
    });
    return;
  }

  isLoading.value = true;

  try {
    // Ejecuta la acción de login en el Store de Pinia (que consume POST /api/login)
    await authStore.login({
      username: username.value,
      password: password.value
    });

    // Notificación flotante de éxito con SweetAlert2
    Swal.fire({
      icon: 'success',
      title: '¡Bienvenido!',
      text: 'Sesión iniciada correctamente.',
      timer: 1500,
      showConfirmButton: false
    });

    // Redirección segura al Dashboard principal
    router.push({ name: 'Dashboard' });

  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Credenciales inválidas o error de conexión con el servidor.';
    
    Swal.fire({
      icon: 'error',
      title: 'Acceso Denegado',
      text: errorMessage,
      confirmButtonColor: '#032C49'
    });
  } finally {
    isLoading.value = false;
  }
};

</script>

<template>
  <div class="login-view-wrapper">
    <div class="login-card">
      
      <!-- Encabezado de la Tarjeta -->
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-[#032C49] mb-1">Sistema de Aplicativos</h1>
        <p class="text-sm text-gray-500">Gestión y Seguimiento de Proyectos</p>
      </div>

      <!-- Formulario de Inicio de Sesión -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        
        <!-- Input de Correo Electrónico -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-2">
            Usuario
          </label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <UserIcon class="h-5 w-5" />
            </span>
            <input
              v-model="username"
              type="text"
              required
              class="w-full pl-10 pr-4 py-2.5 border border-[#BDCEE5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#81299A] text-[#032C49] placeholder-gray-400 text-sm bg-[#F4F1FA]/60 transition-all"
            />
          </div>
        </div>

      <!-- Input de Contraseña -->
      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-2">
          Contraseña
        </label>
        <div class="relative">
          <!-- Icono izquierdo de candado -->
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <LockClosedIcon class="h-5 w-5" />
          </span>

          <!-- Input dinámico (type cambia entre password y text) -->
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            required
            placeholder="••••••••"
            class="w-full pl-10 pr-10 py-2.5 border border-[#BDCEE5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#81299A] text-[#032C49] placeholder-gray-400 text-sm bg-[#F4F1FA]/60 transition-all"
          />

          <!-- Botón derecho para alternar la visibilidad -->
          <button
            type="button"
            @click="togglePasswordVisibility"
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#032C49] focus:outline-none cursor-pointer"
            title="Mostrar u ocultar contraseña"
          >
            <component :is="showPassword ? EyeSlashIcon : EyeIcon" class="h-5 w-5" />
          </button>
        </div>
      </div>

        <!-- Botón de Envío -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full btn-primary flex items-center justify-center py-3 rounded-lg text-white font-semibold transition-all shadow-md hover:opacity-95 disabled:opacity-50 cursor-pointer"
        >
          <span v-if="isLoading" class="inline-block animate-spin mr-2">⏳</span>
          {{ isLoading ? 'Ingresando...' : 'Ingresar' }}
        </button>

      </form>
    </div>
  </div>
</template>