import { clienteApi, esErrorDeRed } from './clienteApi.js'
import { leerEspaciosRespaldo, respaldoDisponible } from './respaldoFirestore.js'

const RUTA = '/espacios'

export async function listarEspacios() {
  try {
    const { data } = await clienteApi.get(RUTA)
    return { datos: data, origen: 'api' }
  } catch (error) {
    if (esErrorDeRed(error) && respaldoDisponible) {
      const datos = await leerEspaciosRespaldo()
      if (datos) return { datos, origen: 'firestore' }
    }
    throw error
  }
}

export async function obtenerEspacio(id) {
  const { data } = await clienteApi.get(`${RUTA}/${id}`)
  return data
}

/** Registra un espacio (POST). */
export async function registrarEspacio(espacio) {
  const { data } = await clienteApi.post(RUTA, espacio)
  return data
}

export async function actualizarEspacio(id, espacio) {
  const { data } = await clienteApi.put(`${RUTA}/${id}`, espacio)
  return data
}

export async function eliminarEspacio(id) {
  await clienteApi.delete(`${RUTA}/${id}`)
}

/** Disponibilidad de un espacio en un día: franjas ocupadas y horas libres. */
export async function obtenerDisponibilidad(id, fecha) {
  const { data } = await clienteApi.get(`${RUTA}/${id}/disponibilidad`, { params: { fecha } })
  return data
}
