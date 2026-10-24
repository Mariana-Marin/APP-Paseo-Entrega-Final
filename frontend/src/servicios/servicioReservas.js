import { clienteApi, esErrorDeRed } from './clienteApi.js'
import { leerReservasRespaldo, respaldoDisponible } from './respaldoFirestore.js'

const RUTA = '/reservas'

export async function listarReservas(filtros = {}) {
  try {
    const { data } = await clienteApi.get(RUTA, { params: filtros })
    return { datos: data, origen: 'api' }
  } catch (error) {
    if (esErrorDeRed(error) && respaldoDisponible) {
      let datos = await leerReservasRespaldo()
      if (datos) {
        if (filtros.espacioId) datos = datos.filter((r) => r.espacioId === filtros.espacioId)
        if (filtros.usuarioId) datos = datos.filter((r) => r.usuarioId === filtros.usuarioId)
        return { datos, origen: 'firestore' }
      }
    }
    throw error
  }
}

export async function obtenerReserva(id) {
  const { data } = await clienteApi.get(`${RUTA}/${id}`)
  return data
}

/** Registra una reserva (POST). Devuelve la reserva con su código de acceso. */
export async function registrarReserva(reserva) {
  const { data } = await clienteApi.post(RUTA, reserva)
  return data
}

export async function actualizarReserva(id, reserva) {
  const { data } = await clienteApi.put(`${RUTA}/${id}`, reserva)
  return data
}

export async function cambiarEstadoReserva(id, estado) {
  const { data } = await clienteApi.patch(`${RUTA}/${id}/estado`, { estado })
  return data
}

export async function eliminarReserva(id) {
  await clienteApi.delete(`${RUTA}/${id}`)
}

export async function verificarReserva(codigo) {
  const { data } = await clienteApi.get(`${RUTA}/verificar/${codigo}`)
  return data
}

/** Resumen de ocupación de todas las zonas en un día (una sola consulta). */
export async function obtenerResumenDia(fecha) {
  const { data } = await clienteApi.get(`${RUTA}/resumen`, { params: { fecha } })
  return data
}
