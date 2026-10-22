import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'sonner'

import { verificarReserva, registrarIngreso } from '../servicios/servicioReservas.js'
import { mensajeDeError } from '../servicios/clienteApi.js'
import { Campo, Entrada } from '../componentes/Campo.jsx'
import { fechaBonita, rangoHoras, urlFoto } from '../utilidades/formato.js'

/**
 * Pantalla de INGRESO (check-in por QR). Flujo:
 *  1. Se llega por el QR del pase con ?codigo=XXXX.
 *  2. Se muestra la info de la reserva y el cupo restante.
 *  3. Cada persona que entra registra nombre + cédula -> el contador baja.
 *  4. Cuando ingresan todas, se genera un QR de verificación para el portero.
 */
export default function Ingreso() {
  const [params] = useSearchParams()
  const codigo = (params.get('codigo') ?? '').toUpperCase()

  const [reserva, setReserva] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ nombre: '', cedula: '' })
  const [errores, setErrores] = useState({})
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    let vivo = true
    async function cargar() {
      if (!codigo) { setError('Falta el código del pase en el enlace.'); setCargando(false); return }
      try {
        const r = await verificarReserva(codigo)
        if (vivo) setReserva(r)
      } catch (e) {
        if (vivo) setError(mensajeDeError(e, 'No se encontró la reserva'))
      } finally {
        if (vivo) setCargando(false)
      }
    }
    cargar()
    return () => { vivo = false }
  }, [codigo])

  const total = reserva?.personas ?? 0
  const ingresados = reserva?.ingresados ?? 0
  const restantes = Math.max(0, total - ingresados)
  const completo = reserva && restantes === 0

  const cambiar = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const registrar = async (e) => {
    e.preventDefault()
    const errs = {}
    if (form.nombre.trim().length < 3) errs.nombre = 'Nombre obligatorio (mín. 3)'
    if (form.cedula.trim().length < 4) errs.cedula = 'Cédula obligatoria (mín. 4)'
    setErrores(errs)
    if (Object.keys(errs).length) return

    setEnviando(true)
    try {
      const actualizada = await registrarIngreso(codigo, { nombre: form.nombre.trim(), cedula: form.cedula.trim() })
      setReserva(actualizada)
      setForm({ nombre: '', cedula: '' })
      const faltan = (actualizada.personas ?? 0) - (actualizada.ingresados ?? 0)
      if (faltan > 0) toast.success(`Ingreso registrado. Faltan ${faltan} persona(s).`)
      else toast.success('¡Todas las personas ingresaron! Pase de verificación generado.')
    } catch (err) {
      toast.error(mensajeDeError(err, 'No se pudo registrar el ingreso'))
    } finally {
      setEnviando(false)
    }
  }

  const urlVerificacion = reserva?.codigoVerificacion
    ? `${window.location.origin}${import.meta.env.BASE_URL}porteria?codigo=${reserva.codigoVerificacion}`
    : ''

  return (
    <div className="contenedor seccion" style={{ maxWidth: 640 }}>
      <div className="franja-imagen mb-4" style={{ minHeight: 170 }}>
        <img src={urlFoto('img/porteria.jpg')} alt="Portería de Paseo de San Francisco" loading="lazy" />
        <div className="velo" />
        <div className="texto">
          <span className="chip chip-oro mb-2"><i className="bi bi-box-arrow-in-right" /> Ingreso</span>
          <h1 className="titulo-display" style={{ color: '#fff', fontSize: 'clamp(1.5rem,4vw,2rem)' }}>Registro de ingreso</h1>
          <p className="mb-0" style={{ color: 'rgba(234,255,245,.9)' }}>Registra a cada persona que entra a la unidad.</p>
        </div>
      </div>

      {cargando ? (
        <div className="skeleton" style={{ height: 220 }} />
      ) : error ? (
        <div className="tarjeta p-4 text-center">
          <i className="bi bi-x-octagon text-danger" style={{ fontSize: '2.4rem' }} />
          <h5 className="fw-bold mt-2">No se pudo cargar el pase</h5>
          <p className="texto-suave mb-0">{error}</p>
        </div>
      ) : (
        <>
          {/* Datos de la reserva */}
          <div className="tarjeta p-4 mb-3">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h5 className="fw-bold mb-1">{reserva.espacioNombre}</h5>
                <div className="texto-suave small">{fechaBonita(reserva.fecha)} · {rangoHoras(reserva.fecha, reserva.tiempo)}</div>
                <div className="texto-tenue small"><i className="bi bi-person me-1" />{reserva.usuarioNombre}</div>
              </div>
              <span className={`estado-badge estado-${reserva.estado}`}>{reserva.estado}</span>
            </div>

            {/* Contador de cupo */}
            <div className="d-flex align-items-center gap-3 mt-3 p-3 tarjeta" style={{ background: 'var(--superficie-2)' }}>
              <div className="text-center" style={{ minWidth: 90 }}>
                <div className="fw-bold texto-marca" style={{ fontSize: '2.4rem', lineHeight: 1 }}>{restantes}</div>
                <div className="texto-tenue small">por ingresar</div>
              </div>
              <div className="flex-grow-1">
                <div className="d-flex justify-content-between small texto-suave mb-1">
                  <span>Ingresadas: {ingresados}</span><span>Total: {total}</span>
                </div>
                <div style={{ height: 10, borderRadius: 999, background: 'var(--borde)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${total ? (ingresados / total) * 100 : 0}%`, background: 'linear-gradient(90deg, var(--marca-500), var(--marca-700))', transition: 'width .4s ease' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de ingreso o QR de verificación */}
          {completo ? (
            <div className="tarjeta p-4 text-center aparecer" style={{ borderColor: 'var(--exito)' }}>
              <i className="bi bi-patch-check-fill text-success" style={{ fontSize: '2.6rem' }} />
              <h5 className="fw-bold mt-2">Ingreso completo</h5>
              <p className="texto-suave">Todas las personas fueron registradas. Muestra este código al portero para verificar.</p>
              {reserva.codigoVerificacion && (
                <>
                  <div className="pase-qr mb-3"><QRCodeSVG value={urlVerificacion} size={168} level="M" /></div>
                  <div className="texto-tenue small">Código de verificación</div>
                  <div className="mono fw-bold" style={{ fontSize: '1.5rem', letterSpacing: '.2em' }}>{reserva.codigoVerificacion}</div>
                </>
              )}
              {reserva.asistentes?.length > 0 && (
                <div className="text-start mt-3">
                  <div className="fw-semibold mb-2">Personas registradas:</div>
                  {reserva.asistentes.map((a, i) => (
                    <div key={i} className="d-flex justify-content-between small texto-suave py-1 border-bottom" style={{ borderColor: 'var(--borde)' }}>
                      <span><i className="bi bi-person-check me-1" />{a.nombre}</span>
                      <span className="mono">CC {a.cedula}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <form className="tarjeta p-4" onSubmit={registrar}>
              <h6 className="fw-bold mb-3"><i className="bi bi-person-plus texto-marca me-2" />Datos de quien ingresa</h6>
              <Campo etiqueta="Nombre completo" icono="bi-person" error={errores.nombre}>
                <Entrada name="nombre" placeholder="Nombre y apellido" value={form.nombre} onChange={cambiar} invalido={errores.nombre} />
              </Campo>
              <Campo etiqueta="Cédula" icono="bi-card-text" error={errores.cedula}>
                <Entrada name="cedula" placeholder="Número de documento" value={form.cedula} onChange={cambiar} invalido={errores.cedula} />
              </Campo>
              <button className="btn-marca w-100" disabled={enviando}>
                {enviando ? <><span className="spinner-border spinner-border-sm me-2" />Registrando…</> : <><i className="bi bi-box-arrow-in-right me-1" />Registrar ingreso</>}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  )
}
