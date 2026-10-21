import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { listarUsuarios, registrarUsuario } from '../servicios/servicioUsuarios.js'
import {
  listarEspacios,
  registrarEspacio,
  obtenerDisponibilidad,
} from '../servicios/servicioEspacios.js'
import {
  listarReservas,
  registrarReserva,
  cambiarEstadoReserva,
  eliminarReserva,
} from '../servicios/servicioReservas.js'
import { mensajeDeError } from '../servicios/clienteApi.js'

// Claves de caché centralizadas para invalidar de forma consistente.
export const claves = {
  usuarios: ['usuarios'],
  espacios: ['espacios'],
  reservas: (filtros = {}) => ['reservas', filtros],
  disponibilidad: (id, fecha) => ['disponibilidad', id, fecha],
}

/* ------------------------------- Lecturas ------------------------------- */

export function useUsuarios() {
  return useQuery({ queryKey: claves.usuarios, queryFn: listarUsuarios })
}

export function useEspacios() {
  return useQuery({ queryKey: claves.espacios, queryFn: listarEspacios })
}

export function useReservas(filtros = {}) {
  return useQuery({
    queryKey: claves.reservas(filtros),
    queryFn: () => listarReservas(filtros),
  })
}

export function useDisponibilidad(espacioId, fecha) {
  return useQuery({
    queryKey: claves.disponibilidad(espacioId, fecha),
    queryFn: () => obtenerDisponibilidad(espacioId, fecha),
    enabled: Boolean(espacioId && fecha),
  })
}

/* ------------------------------ Escrituras ------------------------------ */
// Tras cada registro se invalida la caché del listado correspondiente, de modo
// que la nueva información se ve de inmediato en la consulta (integración real).

export function useRegistrarUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: registrarUsuario,
    onSuccess: (usuario) => {
      qc.invalidateQueries({ queryKey: claves.usuarios })
      toast.success(`Usuario "${usuario.nombres}" registrado`)
    },
    onError: (e) => toast.error(mensajeDeError(e, 'No se pudo registrar el usuario')),
  })
}

export function useRegistrarEspacio() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: registrarEspacio,
    onSuccess: (espacio) => {
      qc.invalidateQueries({ queryKey: claves.espacios })
      toast.success(`Espacio "${espacio.nombre}" registrado`)
    },
    onError: (e) => toast.error(mensajeDeError(e, 'No se pudo registrar el espacio')),
  })
}

export function useRegistrarReserva() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: registrarReserva,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reservas'] })
      qc.invalidateQueries({ queryKey: ['disponibilidad'] })
    },
    onError: (e) => toast.error(mensajeDeError(e, 'No se pudo registrar la reserva')),
  })
}

export function useCambiarEstadoReserva() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, estado }) => cambiarEstadoReserva(id, estado),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reservas'] })
      qc.invalidateQueries({ queryKey: ['disponibilidad'] })
      toast.success('Estado de la reserva actualizado')
    },
    onError: (e) => toast.error(mensajeDeError(e, 'No se pudo actualizar la reserva')),
  })
}

export function useEliminarReserva() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: eliminarReserva,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reservas'] })
      qc.invalidateQueries({ queryKey: ['disponibilidad'] })
      toast.success('Reserva eliminada')
    },
    onError: (e) => toast.error(mensajeDeError(e, 'No se pudo eliminar la reserva')),
  })
}
