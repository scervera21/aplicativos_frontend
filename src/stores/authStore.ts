import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiClient from '@/plugins/axios';
import type { User } from '@/interfaces/User';

export const useAuthStore = defineStore('auth', () => {
  // ==========================================
  // ESTADO REACTIVO (State)
  // ==========================================

  // Recuperamos los datos del LocalStorage si ya existían para mantener la sesión al refrescar la página
  const token = ref<string | null>(localStorage.getItem('token') || null);
  const user = ref<User | null>(JSON.parse(localStorage.getItem('user') || 'null'));
  const roles = ref<string[]>(JSON.parse(localStorage.getItem('roles') || '[]'));
  const permissions = ref<string[]>(JSON.parse(localStorage.getItem('permissions') || '[]'));

  // ======================================== 
  // GETTERS (Computed Propertiections)
  // ==========================================
  const isAuthenticated = computed(() => !!token.value);

  // ==========================================
  // ACCIONES (Actions)
  // ==========================================

  // Iniciar sesión consumiendo el endpoint de la API de Laravel
  async function login(credentials: { username: string; password: string }): Promise<void> {
    const response = await apiClient.post('/auth/login', credentials);
    const data = response.data.data;
    const userData = data.user || data.usuario;

    // Actualizamos el estado reactivo
    token.value = data.token;
    user.value = userData;
    roles.value = userData?.roles || [];
    permissions.value = userData?.permissions || [];

    // Guardamos en el LocalStorage del navegador para persistencia
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('roles', JSON.stringify(roles.value));
    localStorage.setItem('permissions', JSON.stringify(permissions.value));
  }

  // Obtener el perfil actualizado del usuario autenticado (Endpoint /me)
  async function fetchMe(): Promise<void> {
    try {
      const response = await apiClient.get('/auth/me');
      const data = response.data.data;

      user.value = data.usuario;
      roles.value = data.roles || [];
      permissions.value = data.permissions || [];

      localStorage.setItem('user', JSON.stringify(data.usuario));
      localStorage.setItem('roles', JSON.stringify(roles.value));
      localStorage.setItem('permissions', JSON.stringify(permissions.value));
    } catch (error) {
      logout();
    }
  }

  // Cerrar sesión y limpiar el almacenamiento local
  async function logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Aunque falle en el servidor, limpiamos localmente
    } finally {
      token.value = null;
      user.value = null;
      roles.value = [];
      permissions.value = [];

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('roles');
      localStorage.removeItem('permissions');
    }
  }

  // Valida si el usuario actual posee un permiso específico de Spatie
  function hasPermission(permissionName: string): boolean {
    return permissions.value.includes(permissionName);
  }

  // Valida si el usuario posee un rol específico
  function hasRole(roleName: string): boolean {
    return roles.value.includes(roleName);
  }

  return {
    token,
    user,
    roles,
    permissions,
    isAuthenticated,
    login,
    fetchMe,
    logout,
    hasPermission,
    hasRole
  };
});