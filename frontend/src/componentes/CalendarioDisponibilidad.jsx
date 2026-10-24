import { useDisponibilidad } from '../hooks/usarDatos.js'

/**
 * Muestra las franjas horarias de un espacio en una fecha: en vivo marca las
 * ocupadas (rayadas) y permite elegir una hora libre de inicio.
 */
export default function CalendarioDisponibilidad({ espacioId, fecha, duracion, horaElegida, alElegir }) {
  const { data, isLoading, isError } = useDisponibilidad(espacioId, fecha)

  if (!espacioId || !fecha) {
    return <p className="texto-tenue small mb-0">Elige un espacio y una fecha para ver las horas disponibles.</p>
  }
  if (isLoading) return <div className="skeleton" style={{ height: 90 }} />
  if (isError || !data) return <p className="texto-tenue small mb-0">No se pudo cargar la disponibilidad.</p>

  const { horaApertura, horaCierre, ocupadas = [] } = data
  const dur = Number(duracion) || 1

  const estaOcupada = (h) => ocupadas.some((o) => h < o.fin && o.inicio < h + 1)
  // ¿Cabe una reserva de 'dur' horas empezando en h sin chocar y sin pasar el cierre?
  const cabe = (h) => {
    if (h + dur > horaCierre) return false
    for (let k = h; k < h + dur; k++) if (estaOcupada(k)) return false
    return true
  }

  const horas = []
  for (let h = horaApertura; h < horaCierre; h++) horas.push(h)

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
        <span className="texto-suave small">Franjas del {fecha}</span>
        <span className="texto-tenue small d-inline-flex align-items-center gap-1">
          <span className="leyenda-muestra leyenda-libre" />libre
          <span className="leyenda-muestra leyenda-ocupada ms-2" />ocupada
          <span className="leyenda-muestra leyenda-elegida ms-2" />elegida
        </span>
      </div>
      <div className="franja-grid">
        {horas.map((h) => {
          const ocupada = estaOcupada(h)
          const disponible = cabe(h)
          const elegida = Number(horaElegida) === h
          return (
            <button
              type="button"
              key={h}
              disabled={ocupada || !disponible}
              onClick={() => alElegir(h)}
              className={`franja ${ocupada ? 'ocupada' : ''} ${elegida ? 'elegida' : ''}`}
              title={ocupada ? 'Ocupada' : disponible ? `Reservar desde las ${h}:00` : 'No cabe la duración elegida'}
            >
              {String(h).padStart(2, '0')}:00
            </button>
          )
        })}
      </div>
    </div>
  )
}
