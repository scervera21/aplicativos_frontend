import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, LoginResponse, JwtPayload } from '@/interfaces/auth';
import apiClient from '@/plugins/axios';

export const useAuthStore = defineStore('auth', () => {
  // Estado Reactivo
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(localStorage.getItem('access_token'));

  // Propiedades Computadas (Getters)
  const isAuthenticated = computed(() => !!accessToken.value);

  const decodedPayload = computed((): JwtPayload | null => {
    if (!accessToken.value) return null;
    try {
      const payloadBase64 = accessToken.value.split('.')[1];
      const decoded = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  });

  const permissions = computed(() => decodedPayload.value?.permissions ?? { access: [], actions: [] });

  // Acciones (Functions)
  async function login(credentials: { email: string; password: string }): Promise<boolean> {
    try {
      const { data } = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
      if (data.success) {
        accessToken.value = data.data.access_token;
        user.value = data.data.user;
        localStorage.setItem('access_token', data.data.access_token);
        localStorage.setItem('refresh_token', data.data.refresh_token);
        return true;
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
    return false;
  }

  function logout() {
    accessToken.value = null;
    user.value = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  return {
    user,
    accessToken,
    isAuthenticated,
    permissions,
    login,
    logout,
  };
});