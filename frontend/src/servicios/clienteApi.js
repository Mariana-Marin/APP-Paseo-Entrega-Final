import axios from 'axios'

// Cliente HTTP central. La URL base se configura con VITE_API_URL; en local
// apunta al backend Spring Boot. En producción (GitHub Pages) puede apuntar al
// backend desplegado o quedar vacía para usar el respaldo directo a Firestore.
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'

export const clienteApi = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 12_000,
})

/**
 * Extrae un mensaje de error legible. El backend devuelve { mensaje }, pero
 * también contemplamos errores de red o respuestas inesperadas.
 */
export function mensajeDeError(error, porDefecto = 'Ocurrió un error inesperado') {
  if (error?.response?.data?.mensaje) return error.response.data.mensaje
  if (error?.response?.data?.message) return error.response.data.message
  if (error?.code === 'ERR_NETWORK') return 'No se pudo conectar con el servidor'
  if (error?.message) return error.message
  return porDefecto
}

/** Indica si el error fue por no poder contactar al backend (para activar el respaldo). */
export function esErrorDeRed(error) {
  return (
    error?.code === 'ERR_NETWORK' ||
    error?.code === 'ECONNABORTED' ||
    error?.message === 'Network Error' ||
    !error?.response
  )
}
