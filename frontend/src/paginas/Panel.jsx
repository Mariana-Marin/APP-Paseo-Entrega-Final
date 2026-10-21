import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useEspacios, useReservas, useUsuarios } from '../hooks/usarDatos.js'
import { useSesion } from '../contexto/SesionContexto.jsx'
import { fechaBonita, rangoHoras, etiquetaEstado } from '../utilidades/formato.js'

function Metrica({ icono, color, valor, etiqueta }) {
  return (
    <div className="tarjeta metrica">
      <span className="ico" style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color }}>
        <i className={`bi ${icono}`} />
      </span>
      <div>
        <div className="fw-bold" style={{ fontSize: '1.6rem', lineHeight: 1 }}>{valor}</div>
        <div className="texto-tenue small">{etiqueta}</div>
      </div>
    </div>
  )
}

/** Mapa de calor de ocupación: espacios (filas) x horas (columnas). */
function MapaCalor({ espacios, reservas }) {
  const horas = Array.from({ length: 17 }, (_, i) => i + 6) // 6:00 a 22:00
  const conteo = useMemo(() => {
    const m = {}
    let max = 1
    for (const r of reservas) {
      if (r.estado === 'CANCELADA' || !r.fecha) continue
      const h0 = new Date(r.fecha).getHours()
      const h1 = h0 + (r.tiempo || 1)
      for (let h = h0; h < h1; h++) {
        const k = `${r.espacioId}-${h}`
        m[k] = (m[k] || 0) + 1
        if (m[k] > max) max = m[k]
      }
    }
    return { m, max }
  }, [reservas])

  if (!espacios.length) return null

  return (
    <div className="tarjeta p-4">
      <h6 className="fw-bold mb-3"><i className="bi bi-grid-3x3 texto-marca me-2" />Mapa de calor de ocupación</h6>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: '.72rem', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '4px 8px', color: 'var(--texto-tenue)' }}>Espacio</th>
              {horas.map((h) => <th key={h} style={{ padding: '4px 2px', color: 'var(--texto-tenue)', fontWeight: 600 }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {espacios.map((e) => (
              <tr key={e.id}>
                <td style={{ padding: '4px 8px', whiteSpace: 'nowrap', fontWeight: 600 }}>{e.nombre}</td>
                {horas.map((h) => {
                  const c = conteo.m[`${e.id}-${h}`] || 0
                  const intensidad = c / conteo.max
                  return (
                    <td key={h} style={{ padding: 2 }}>
                      <div
                        title={`${c} reserva(s) a las ${h}:00`}
                        style={{
                          height: 22, borderRadius: 5,
                          background: c ? `color-mix(in srgb, var(--marca-500) ${20 + intensidad * 80}%, transparent)` : 'var(--superficie-2)',
                          border: '1px solid var(--borde)',
                        }}
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function Panel() {
  const { usuario, autenticado } = useSesion()
  const espacios = useEspacios().data?.datos ?? []
  const reservas = useReservas().data?.datos ?? []
  const usuarios = useUsuarios().data?.datos ?? []

  const hoy = new Date().toISOString().slice(0, 10)
  const reservasHoy = reservas.filter((r) => (r.fecha || '').startsWith(hoy) && r.estado !== 'CANCELADA')
  const proximas = [...reservas]
    .filter((r) => r.estado !== 'CANCELADA' && new Date(r.fecha) >= new Date())
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    .slice(0, 6)

  return (
    <div className="contenedor seccion">
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
        <div>
          <span className="chip mb-2"><i className="bi bi-speedometer2" /> Panel</span>
          <h1 className="titulo-display" style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)' }}>
            {autenticado ? `Hola, ${usuario.nombres.split(' ')[0]}` : 'Panel de administración'}
          </h1>
          <p className="texto-suave mb-0">Resumen de la actividad de las zonas comunes.</p>
        </div>
        <Link to="/reservas" className="btn-marca"><i className="bi bi-calendar-plus me-1" />Nueva reserva</Link>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3"><Metrica icono="bi-grid-3x3-gap" color="#10b981" valor={espacios.length} etiqueta="Espacios" /></div>
        <div className="col-6 col-lg-3"><Metrica icono="bi-calendar-check" color="#3b82f6" valor={reservas.length} etiqueta="Reservas totales" /></div>
        <div className="col-6 col-lg-3"><Metrica icono="bi-calendar-day" color="#f5c451" valor={reservasHoy.length} etiqueta="Reservas hoy" /></div>
        <div className="col-6 col-lg-3"><Metrica icono="bi-people" color="#8b5cf6" valor={usuarios.length} etiqueta="Residentes" /></div>
      </div>

      <div className="row g-4">
        <div className="col-lg-7"><MapaCalor espacios={espacios} reservas={reservas} /></div>
        <div className="col-lg-5">
          <div className="tarjeta p-4 h-100">
            <h6 className="fw-bold mb-3"><i className="bi bi-clock-history texto-marca me-2" />Próximas reservas</h6>
            {proximas.length === 0 ? (
              <p className="texto-suave mb-0">No hay reservas próximas.</p>
            ) : (
              <div className="d-flex flex-column gap-2">
                {proximas.map((r) => (
                  <div key={r.id} className="d-flex justify-content-between align-items-center tarjeta p-2 px-3">
                    <div>
                      <div className="fw-semibold">{r.espacioNombre}</div>
                      <div className="texto-tenue small">{fechaBonita(r.fecha)} · {rangoHoras(r.fecha, r.tiempo)}</div>
                    </div>
                    <span className={`estado-badge estado-${r.estado}`}>{etiquetaEstado(r.estado)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
