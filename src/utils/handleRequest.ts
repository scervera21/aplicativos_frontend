import { type AxiosError } from 'axios'
import { useAuthStore } from '@/stores/authStore'
import router from '@/router'
import Swal from 'sweetalert2'

const handleRequest = (error: AxiosError) => {

    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        Swal.fire('Tiempo de Espera Agotado', 'La solicitud excedió el tiempo de espera. Por favor, intenta nuevamente.', 'error')
      } else {
        Swal.fire('Error de Conexión', 'No se pudo establecer conexión con el servidor. La sesión ha sido cerrada.', 'error')

        const authStore = useAuthStore()
        if(authStore.isAuthenticated) {
          authStore.logout()
        }
      }
      return
    }
  
    const status = error.response.status
    const data = error.response.data
    const errorMessage = (data as any)?.message || 'Ocurrió un error inesperado.'

    switch (status) {
      case 400:
        Swal.fire('Solicitud Incorrecta', errorMessage, 'error')
        break
      case 401:
        Swal.fire('No Autorizado', errorMessage, 'error')
        break
      case 403:
        Swal.fire('Prohibido', errorMessage || 'No posee los permisos requeridos', 'error')
        router.push('/dashboard')
        break
      case 404:
        Swal.fire('No encontrado', errorMessage || 'El recurso solicitado no existe.', 'error')
        break
      case 422:
        Swal.fire('Error de Validación', errorMessage, 'error')
        break
      case 423:
        Swal.fire('Bloqueado', errorMessage || 'Su cuenta ha sido bloqueada por intentos fallidos', 'error')
        break
      case 500:
        Swal.fire('Error de Servidor', errorMessage || 'Ocurrió un problema en el servidor. Inténtalo más tarde.', 'error')
        break
      default:
        Swal.fire('Error', errorMessage, 'error')
        break
    }
}

export default handleRequest