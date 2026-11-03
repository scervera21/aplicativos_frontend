import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { handleRequest } from '@/utils/handleRequest';

// Creación de instancia de axios con configuraciones base
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000, // 15 segundos para que el servidor responda (evita que la petición se quede colgada)
});

// Variables de control para manejar múltiples peticiones simultáneas durante el refresco
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Interceptor de solicitudes para agregar el token JWT
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Interceptor de respuestas para manejar errores y refresco de tokens
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response) {
      const status = error.response.status;
      const requestUrl = originalRequest.url || '';

      // Si la respuesta es 401 y no estamos intentando loguearnos ni refrescar ya
      if (status === 401 && !requestUrl.includes('/auth/login') && !requestUrl.includes('/auth/refresh')) {
        
        // Si ya intentamos refrescar y dio 401 de nuevo, la sesión expiró por completo
        if (originalRequest._retry) {
          clearSessionAndRedirect();
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (isRefreshing) {
          // Si hay otro refresco en proceso, ponemos la petición en cola
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return apiClient(originalRequest);
            })
            .catch(err => Promise.reject(err));
        }

        isRefreshing = true;

        try {
          const currentToken = localStorage.getItem('token');
          
          // Llamada directa a axios sin interceptores para evitar bucles infinitos
          const response = await axios.post(
            `${import.meta.env.VITE_APP_API_URL || 'http://localhost:8000/api/v1'}/auth/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${currentToken}`
              }
            }
          );

          const newToken = response.data.data.token;

          // Guardamos el nuevo token renovado
          localStorage.setItem('token', newToken);
          
          // Actualizamos la cabecera de la petición original
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          processQueue(null, newToken);
          isRefreshing = false;

          // Reintentamos la petición original con el nuevo token
          return apiClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;
          clearSessionAndRedirect();
          return Promise.reject(refreshError);
        }
      }
    }

     // Para cualquier otro error HTTP (excepto login fallido), delegamos al manejador centralizado de errores
    const requestUrl = originalRequest.url || '';
    if (!requestUrl.includes('/auth/login')) {
      handleRequest(error);
    }
    return Promise.reject(error);
  }
);

/**
 * Función auxiliar para limpiar credenciales locales y expulsar al login
 */
function clearSessionAndRedirect() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('roles');
  localStorage.removeItem('permissions');

  // Redirigimos al login
  if (window.location.pathname !== '/auth/login') {
    window.location.href = '/auth/login';
  }
}

export default apiClient;