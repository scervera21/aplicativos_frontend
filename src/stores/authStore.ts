import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, JwtPayload } from '@/interfaces/auth';
import apiClient from '@/plugins/axios';
import router from '@/router';

export const useAuthStore = defineStore('auth', () => {
  // Estado Reactivo
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(localStorage.getItem('access_token'));

  // Propiedades Computadas (Getters)

  // Verificación de autenticación
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value);

  // Verificación si el usuario debe cambiar su contraseña
  const isPasswordChangeRequired = computed((): boolean => {
    return !user.value?.password_changed;
  });

  const decodedPayload = computed((): JwtPayload | null => {
    if (!accessToken.value) return null;
    try {
      const parts = accessToken.value.split('.');
      if (parts.length < 2 || !parts[1]) return null;
      const payloadBase64 = parts[1];
      const decoded = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  });

  // Permisos del usuario desde el token
  const permissions = computed(() => {
    // Si el usuario no está logueado
    if (!user.value) return { access: [], actions: [] };
    
    // Si los permisos vienen en el token
    if (decodedPayload.value?.permissions) {
      return decodedPayload.value.permissions;
    }
    
    // Si los permisos vienen en las relaciones del usuario
    const accessList: string[] = [];
    const actionsList: string[] = [];
    if (user.value?.roles) {
      for (const role of user.value.roles) {
        if (role.permissions) {
          for (const perm of role.permissions) {
            if (perm.category === 'access') {
              accessList.push(perm.name);
            } else if (perm.category === 'action') {
              actionsList.push(perm.name);
            }
          }
        }
      }
    }
    return { access: accessList, actions: actionsList };
  });

  // Lista de permisos del usuario
  const userPermissions = computed(() => {
    const list: string[] = [];
    if (permissions.value.access) list.push(...permissions.value.access);
    if (permissions.value.actions) list.push(...permissions.value.actions);
    return list;
  });

  // Verifica si el usuario puede acceder a la vista de un módulo
  function hasAccess(module: string): boolean {
    return userPermissions.value.includes(`acceder_${module}`);
  }

  // Verifica si el usuario puede realizar una acción específica (ej: crear, editar, eliminar)
  function hasAction(module: string, action: string): boolean {
    return userPermissions.value.includes(`${action}_${module}`);
  }

  // Acciones (Functions)
  async function login(credentials: { username: string; password: string }): Promise<boolean> {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      const resData = response.data;

      // Backend puede retornar { token, user } directo o { success: true, data: { ... } }
      const token = resData.token || resData.access_token || resData.data?.access_token || resData.data?.token;
      const userData = resData.user || resData.data?.user;

      if (token) {
        accessToken.value = token;
        user.value = userData || null;
        localStorage.setItem('access_token', token);

        const refreshToken = resData.refresh_token || resData.data?.refresh_token;
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }
        return true;
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
    return false;
  }

  function saveNewToken(newToken: string, _expiresIn?: number) {
    accessToken.value = newToken;
    localStorage.setItem('access_token', newToken);
  }

  // Actualiza la marca de cambio de contraseña
  function setPasswordChanged(timestamp: string) {
    if (user.value) {
      user.value.password_changed = timestamp
      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  async function logout() {
    try {
      if (accessToken.value) {
        await apiClient.post('/auth/logout');
      }
    } catch (error) {
      console.error('Fallo al cerrar sesión en el servidor:', error)
    } finally {
      accessToken.value = null;
      user.value = null;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');

      router.push('/login');
    }
  }

  return {
    user,
    accessToken,
    isAuthenticated,
    permissions,
    userPermissions,
    hasAccess,
    hasAction,
    isPasswordChangeRequired,
    login,
    saveNewToken,
    setPasswordChanged,
    logout,
  };
});