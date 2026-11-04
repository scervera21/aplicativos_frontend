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

  // Normalizador auxiliar para arreglos de roles o permisos (soporta strings u objetos)
  function normalizeNames(items: any[] | undefined): string[] {
    if (!items || !Array.isArray(items)) return [];
    return items.map(item => (typeof item === 'string' ? item : item.name || '')).filter(Boolean);
  }

  // Iniciar sesión consumiendo el endpoint de la API de Laravel
  async function login(credentials: { username: string; password: string }): Promise<void> {
    const response = await apiClient.post('/auth/login', credentials);
    const data = response.data.data;
    const userData = data.user || data.usuario;

    const normalizedRoles = normalizeNames(userData?.roles);
    const normalizedPermissions = normalizeNames(userData?.permissions);

    // Actualizamos el estado reactivo
    token.value = data.token;
    user.value = userData;
    roles.value = normalizedRoles;
    permissions.value = normalizedPermissions;

    // Guardamos en el LocalStorage del navegador para persistencia
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('roles', JSON.stringify(normalizedRoles));
    localStorage.setItem('permissions', JSON.stringify(normalizedPermissions));
  }

  // Obtener el perfil actualizado del usuario autenticado (Endpoint /me)
  async function fetchMe(): Promise<void> {
    try {
      const response = await apiClient.get('/auth/me');
      const data = response.data.data;
      const userData = data.usuario || data.user;

      const normalizedRoles = normalizeNames(data.roles || userData?.roles);
      const normalizedPermissions = normalizeNames(data.permissions || userData?.permissions);

      user.value = userData;
      roles.value = normalizedRoles;
      permissions.value = normalizedPermissions;

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('roles', JSON.stringify(normalizedRoles));
      localStorage.setItem('permissions', JSON.stringify(normalizedPermissions));
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

  // Valida si el usuario posee al menos uno de los permisos indicados
  function hasAnyPermission(permissionNames: string[]): boolean {
    return permissionNames.some(p => permissions.value.includes(p));
  }

  // Valida si el usuario posee un rol específico
  function hasRole(roleName: string): boolean {
    return roles.value.includes(roleName);
  }

  // Valida si el usuario posee al menos uno de los roles indicados
  function hasAnyRole(roleNames: string[]): boolean {
    return roleNames.some(r => roles.value.includes(r));
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
    hasAnyPermission,
    hasRole,
    hasAnyRole
  };
});