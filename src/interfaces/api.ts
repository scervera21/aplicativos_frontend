/**
 * Define el formato de la respuesta de la API.
 * @template T El tipo de dato que se espera recibir.
 * @property {number} status - El estado HTTP de la respuesta.
 * @property {boolean} success - Indica si la petición fue exitosa.
 * @property {T} data - El dato recibido.
 * @property {string} message - El mensaje de la respuesta.
 * @property {Record<string, string[]> | null} errors - Los errores de la respuesta.
 */

export interface ApiResponse <T = unknown> {
  status: number;
  success: boolean;
  data: T;
  message: string;
  errors: Record<string, string[]> | null;
}