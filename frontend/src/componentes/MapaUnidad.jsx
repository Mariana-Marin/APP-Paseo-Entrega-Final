import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEspacios, useReservas } from '../hooks/usarDatos.js'
import { categoria, hoyISO } from '../utilidades/formato.js'

/**
 * Mapa vivo de la unidad: cada zona muestra su estado AHORA (libre / ocupado /
 * pronto) calculado con las reservas de hoy. Al hacer clic lleva a reservar.
 */
export default function MapaUnidad() {
  const navegar = useNavigate()
  const { data: espaciosData } = useEspacios()
  const { data: reservasData } = useReservas()

  const espacios = espaciosData?.datos ?? []
  const reservas = reservasData?.datos ?? []

  const estados = useMemo(() => {
    const ahora = new Date()
    const hoy = hoyISO()
    const hora = ahora.getHours()
    const mapa = {}
    for (const e of espacios) {
      const deHoy = reservas.filter(
        (r) => r.espacioId === e.id && r.estado !== 'CANCELADA' && (r.fecha || '').startsWith(hoy),
      )
      let estado = 'libre'
      for (const r of deHoy) {
        const h0 = new Date(r.fecha).getHours()
        const h1 = h0 + (r.tiempo || 1)
        if (hora >= h0 && hora < h1) { estado = 'ocupado'; break }
        if (h0 > hora && h0 - hora <= 2) estado = 'pronto'
      }
      mapa[e.id] = estado
    }
    return mapa
  }, [espacios, reservas])

  if (!espacios.length) return null

  const texto = { libre: 'Disponible ahora', ocupado: 'Ocupado ahora', pronto: 'Reservado pronto' }

  return (
    <div className="mapa-unidad">
      {espacios.map((e) => {
        const cat = categoria(e.categoria)
        const estado = estados[e.id] ?? 'libre'
        return (
          <div key={e.id} className="mapa-zona" onClick={() => navegar(`/reservas?espacio=${e.id}`)}>
            <span className={`punto-estado ${estado}`} />
            <i className={`bi ${cat.icono} texto-marca`} style={{ fontSize: '1.5rem' }} />
            <div className="fw-bold mt-2" style={{ lineHeight: 1.1 }}>{e.nombre}</div>
            <div className="texto-tenue small">{texto[estado]}</div>
          </div>
        )
      })}
    </div>
  )
}
