import { type AxiosError } from 'axios'
import Swal from 'sweetalert2'

export function handleRequest(error: AxiosError): string {
  
  let message = ''

  // Manejo de Errores de Red (sin respuesta del servidor)
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      message = 'Tiempo de Espera Agotado: La petición tardó demasiado. Intente nuevamente.'
    } else {
      // ERR_CONNECTION_REFUSED o pérdida total de conexión
      message = 'Error de Red: No se pudo conectar con el servidor.'
    }
  }
  else {
    const status = error.response.status;
    const data: any = error.response.data;

    switch (status) {
      case 400:
        message = data.message || 'Solicitud incorrecta';
        break;
      case 401:
        message = 'Sesión expirada o credenciales inválidas. Por favor, inicia sesión nuevamente';
        // Limpieza de credenciales locales
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/auth/login') {
          window.location.href = '/auth/login';
        }
        break;
      case 403:
        message = 'Acceso denegado. No posee los permisos requeridos para realizar esta acción';
        break;
      case 404:
        message = data.message || 'Recurso no encontrado';
        break;
      // case 422:
      //   // Manejo específico para los errores de validación (FormRequests)
      //   if (data.errors) {
      //     const erroresArray = Object.values(data.errors).flat() as string[];
      //     message = erroresArray.join(' ');
      //   } else {
      //     message = data.message || 'Error de validación en los datos enviados';
      //   }
      //   break;
      case 423:
        // Bloqueo por intentos de inicio de sesión fallidos
        message = data.message || 'Su cuenta ha sido bloqueada por intentos fallidos';
        break;
      case 500:
        message = data.message || 'Error interno del servidor. Intentelo más tarde';
        break;
      default:
        message = data.message || `Ocurrió un error inesperado (${status})`;
        break
    }
  }

  Swal.fire({
    icon: 'error',
    text: message,
    confirmButtonColor: '#3085d6',
    confirmButtonText: 'Aceptar',
  })

  return message
}