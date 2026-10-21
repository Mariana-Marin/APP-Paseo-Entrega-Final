import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { verificarReserva } from '../servicios/servicioReservas.js'
import { mensajeDeError } from '../servicios/clienteApi.js'
import { fechaBonita, rangoHoras, etiquetaEstado, urlFoto } from '../utilidades/formato.js'

/**
 * Pantalla de portería: se ingresa (o llega por QR con ?codigo=) el código de
 * acceso y el sistema valida la reserva contra el backend.
 */
export default function Porteria() {
  const [params] = useSearchParams()
  const [codigo, setCodigo] = useState(params.get('codigo') ?? '')
  const [estado, setEstado] = useState('inicial') // inicial | cargando | ok | error
  const [reserva, setReserva] = useState(null)
  const [error, setError] = useState('')

  const verificar = async (valor) => {
    const cod = (valor ?? codigo).trim().toUpperCase()
    if (!cod) return
    setEstado('cargando'); setError(''); setReserva(null)
    try {
      const r = await verificarReserva(cod)
      setReserva(r)
      setEstado('ok')
    } catch (e) {
      setError(mensajeDeError(e, 'Código no encontrado'))
      setEstado('error')
    }
  }

  // Si llega por QR con ?codigo=, verifica automáticamente.
  useEffect(() => {
    const c = params.get('codigo')
    if (c) verificar(c)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const vigente = reserva?.estado === 'CONFIRMADA'

  return (
    <div className="contenedor seccion" style={{ maxWidth: 620 }}>
      <div className="franja-imagen mb-4" style={{ minHeight: 190 }}>
        <img src={urlFoto('img/porteria.jpg')} alt="Portería de Paseo de San Francisco" loading="lazy" />
        <div className="velo" />
        <div className="texto">
          <span className="chip chip-oro mb-2"><i className="bi bi-qr-code-scan" /> Portería</span>
          <h1 className="titulo-display" style={{ color: '#fff', fontSize: 'clamp(1.6rem,4vw,2.2rem)' }}>Verificar pase de acceso</h1>
          <p className="mb-0" style={{ color: 'rgba(234,255,245,.9)' }}>Ingresa el código del pase o escanea el QR del residente.</p>
        </div>
      </div>

      <div className="tarjeta p-4">
        <div className="d-flex gap-2">
          <input
            className="control mono"
            style={{ letterSpacing: '.25em', textTransform: 'uppercase', fontWeight: 700 }}
            placeholder="CÓDIGO"
            maxLength={6}
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && verificar()}
          />
          <button className="btn-marca" onClick={() => verificar()} disabled={estado === 'cargando'}>
            {estado === 'cargando' ? <span className="spinner-border spinner-border-sm" /> : <><i className="bi bi-search me-1" />Verificar</>}
          </button>
        </div>

        {estado === 'error' && (
          <div className="tarjeta p-4 mt-3 text-center" style={{ borderColor: 'var(--peligro)' }}>
            <i className="bi bi-x-octagon text-danger" style={{ fontSize: '2.5rem' }} />
            <h5 className="fw-bold mt-2 mb-1">Pase no válido</h5>
            <p className="texto-suave mb-0">{error}</p>
          </div>
        )}

        {estado === 'ok' && reserva && (
          <div className="tarjeta p-4 mt-3 aparecer" style={{ borderColor: vigente ? 'var(--exito)' : 'var(--aviso)' }}>
            <div className="text-center mb-3">
              <i className={`bi ${vigente ? 'bi-patch-check-fill text-success' : 'bi-exclamation-triangle-fill text-warning'}`} style={{ fontSize: '2.6rem' }} />
              <h5 className="fw-bold mt-2 mb-0">{vigente ? 'Acceso autorizado' : 'Reserva no vigente'}</h5>
              <span className={`estado-badge estado-${reserva.estado}`}>{etiquetaEstado(reserva.estado)}</span>
            </div>
            <div className="d-flex justify-content-between py-1"><span className="texto-suave">Residente</span><strong>{reserva.usuarioNombre}</strong></div>
            <div className="d-flex justify-content-between py-1"><span className="texto-suave">Espacio</span><strong>{reserva.espacioNombre}</strong></div>
            <div className="d-flex justify-content-between py-1"><span className="texto-suave">Fecha</span><strong>{fechaBonita(reserva.fecha)}</strong></div>
            <div className="d-flex justify-content-between py-1"><span className="texto-suave">Horario</span><strong>{rangoHoras(reserva.fecha, reserva.tiempo)}</strong></div>
            <div className="d-flex justify-content-between py-1"><span className="texto-suave">Personas</span><strong>{reserva.personas}</strong></div>
          </div>
        )}
      </div>
    </div>
  )
}
