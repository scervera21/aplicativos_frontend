import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, JwtPayload } from '@/interfaces/auth';
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
      const parts = accessToken.value.split('.');
      if (parts.length < 2 || !parts[1]) return null;
      const payloadBase64 = parts[1];
      const decoded = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  });

  const permissions = computed(() => {
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

  const userPermissions = computed(() => {
    const list: string[] = [];
    if (permissions.value.access) list.push(...permissions.value.access);
    if (permissions.value.actions) list.push(...permissions.value.actions);
    return list;
  });

  // Acciones (Functions)
  async function login(credentials: { username?: string; email?: string; password: string }): Promise<boolean> {
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

  async function logout() {
    try {
      if (accessToken.value) {
        await apiClient.post('/auth/logout');
      }
    } catch (error) {
      console.warn('Error notificando logout al backend:', error);
    } finally {
      accessToken.value = null;
      user.value = null;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  return {
    user,
    accessToken,
    isAuthenticated,
    permissions,
    userPermissions,
    login,
    saveNewToken,
    logout,
  };
});