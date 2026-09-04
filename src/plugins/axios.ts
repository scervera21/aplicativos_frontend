import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';  // AxiosResponse define el tipo de dato que se espera recibir.
import { useAuthStore } from '@/stores/authStore';
import handleRequest from '@/utils/handleRequest';

// Crear una instancia de Axios para usar en toda la aplicación.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
});


// Interceptor para agregar el token de acceso a cada petición.
apiClient.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  const token = authStore.accessToken;

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
      
    }, (error) => {
      return Promise.reject(error);
    }
);

// Interceptor de respuesta para manejar los códigos de estado http y mostrar mensajes de error.
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const authStore = useAuthStore();

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Manejo de errores de autenticación 401 (sin token de acceso o token expirado)
    if (error.response?.status === 401 && !originalRequest._retry) {

      if (originalRequest.url?.includes('/v1/auth/refresh') || originalRequest?.url?.includes('/v1/auth/login')) {
        authStore.logout();
        return Promise.reject(error);
      }

    }

    // Manejo del logout
    if (originalRequest?.url?.includes('/v1/auth/logout')) {
      return Promise.reject(error); 
    }

    // Manejo de errores de servidor.
    handleRequest(error);
    return Promise.reject(error);
  }
);

export default apiClient;