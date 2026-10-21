import { clienteApi, esErrorDeRed } from './clienteApi.js'
import { leerUsuariosRespaldo, respaldoDisponible } from './respaldoFirestore.js'

const RUTA = '/usuarios'

/** Lista usuarios. Si el backend no responde, intenta leer de Firestore. */
export async function listarUsuarios() {
  try {
    const { data } = await clienteApi.get(RUTA)
    return { datos: data, origen: 'api' }
  } catch (error) {
    if (esErrorDeRed(error) && respaldoDisponible) {
      const datos = await leerUsuariosRespaldo()
      if (datos) return { datos, origen: 'firestore' }
    }
    throw error
  }
}

export async function obtenerUsuario(id) {
  const { data } = await clienteApi.get(`${RUTA}/${id}`)
  return data
}

/** Registra un usuario (POST). Devuelve el usuario creado (sin contraseña). */
export async function registrarUsuario(usuario) {
  const { data } = await clienteApi.post(RUTA, usuario)
  return data
}

export async function actualizarUsuario(id, usuario) {
  const { data } = await clienteApi.put(`${RUTA}/${id}`, usuario)
  return data
}

export async function eliminarUsuario(id) {
  await clienteApi.delete(`${RUTA}/${id}`)
}

export async function iniciarSesion(credenciales) {
  const { data } = await clienteApi.post(`${RUTA}/login`, credenciales)
  return data
}
