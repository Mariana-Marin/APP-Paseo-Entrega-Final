import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import {
  useEspacios, useReservas,
  useRegistrarReserva, useCambiarEstadoReserva, useEliminarReserva,
} from '../hooks/usarDatos.js'
import { useSesion } from '../contexto/SesionContexto.jsx'
import { Campo, Entrada, Selector, Area } from '../componentes/Campo.jsx'
import { CargandoFilas, EstadoError, EstadoVacio, AvisoRespaldo } from '../componentes/Estados.jsx'
import CalendarioDisponibilidad from '../componentes/CalendarioDisponibilidad.jsx'
import ClimaZona from '../componentes/ClimaZona.jsx'
import PaseReserva from '../componentes/PaseReserva.jsx'
import { fechaBonita, rangoHoras, hoyISO, etiquetaEstado } from '../utilidades/formato.js'
import { iaDisponible, interpretarReservaLibre } from '../servicios/iaGemini.js'

export default function Reservas() {
  const [params] = useSearchParams()
  const { usuario, autenticado, esAdmin } = useSesion()
  const espaciosQ = useEspacios()
  // El admin ve todas las reservas; el residente solo las suyas (tarea 4).
  const reservasQ = useReservas(esAdmin ? {} : { usuarioId: usuario?.id })
  const registrar = useRegistrarReserva()
  const cambiarEstado = useCambiarEstadoReserva()
  const eliminar = useEliminarReserva()

  const espacios = espaciosQ.data?.datos ?? []
  const reservas = reservasQ.data?.datos ?? []

  const [form, setForm] = useState({
    espacioId: params.get('espacio') ?? '',
    fecha: hoyISO(),
    hora: '',
    tiempo: 2,
    personas: 1,
    notas: '',
  })
  const [errores, setErrores] = useState({})
  const [pase, setPase] = useState(null)
  const [frase, setFrase] = useState('')
  const [interpretando, setInterpretando] = useState(false)

  const espacioSel = useMemo(
    () => espacios.find((e) => e.id === form.espacioId),
    [espacios, form.espacioId],
  )

  const cambiar = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const validar = () => {
    const e = {}
    if (!form.espacioId) e.espacioId = 'Elige un espacio'
    if (!form.fecha) e.fecha = 'Elige una fecha'
    if (form.hora === '') e.hora = 'Elige una hora de inicio'
    if (!form.personas || Number(form.personas) < 1) e.personas = 'Mínimo 1 persona'
    if (espacioSel?.aforo && Number(form.personas) > espacioSel.aforo) e.personas = `Aforo máximo ${espacioSel.aforo}`
    return e
  }

  const enviar = async (e) => {
    e.preventDefault()
    const errs = validar()
    setErrores(errs)
    if (Object.keys(errs).length) return
    const horaStr = String(form.hora).padStart(2, '0')
    try {
      const creada = await registrar.mutateAsync({
        espacioId: form.espacioId,
        usuarioId: usuario.id, // siempre el usuario logueado (tarea 5)
        fecha: `${form.fecha}T${horaStr}:00`,
        tiempo: Number(form.tiempo),
        personas: Number(form.personas),
        notas: form.notas || null,
      })
      toast.success(`Reserva confirmada · código ${creada.codigoAcceso}`)
      setPase(creada)
      setForm((f) => ({ ...f, hora: '', notas: '' }))
    } catch {
      /* el hook muestra el error del backend */
    }
  }

  const interpretar = async () => {
    if (!frase.trim()) return
    setInterpretando(true)
    try {
      const r = await interpretarReservaLibre(frase, espacios)
      if (r?.espacioId) {
        const [fecha, horaMin] = (r.fecha ?? '').split('T')
        setForm((f) => ({
          ...f,
          espacioId: r.espacioId,
          fecha: fecha || f.fecha,
          hora: horaMin ? parseInt(horaMin, 10) : f.hora,
          tiempo: r.tiempo ?? f.tiempo,
          personas: r.personas ?? f.personas,
        }))
        toast.success('Rellené el formulario con lo que entendí. Revisa y confirma.')
      } else {
        toast.info('No logré entenderlo. Prueba a indicar espacio, día y hora.')
      }
    } catch {
      toast.error('No se pudo interpretar la frase')
    } finally {
      setInterpretando(false)
    }
  }

  return (
    <div className="contenedor seccion">
      <div className="mb-4">
        <span className="chip mb-2"><i className="bi bi-calendar-check" /> Módulo de reservas</span>
        <h1 className="titulo-display" style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)' }}>Reserva tu espacio</h1>
        <p className="texto-suave mb-0">Elige la zona, mira las horas libres en vivo y confirma. Recibirás un pase con QR.</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          {/* Solo se puede reservar con sesión iniciada (tarea 5) */}
          {!autenticado ? (
            <div className="tarjeta p-4 p-md-5 text-center">
              <i className="bi bi-lock texto-marca" style={{ fontSize: '2.6rem' }} />
              <h5 className="fw-bold mt-3">Inicia sesión para reservar</h5>
              <p className="texto-suave">Para apartar una zona común necesitas entrar con tu cuenta de residente.</p>
              <Link to="/entrar" className="btn-marca"><i className="bi bi-box-arrow-in-right me-1" />Entrar</Link>
            </div>
          ) : (
            <>
              {/* Reserva por lenguaje natural con IA */}
              {iaDisponible() && (
                <div className="tarjeta p-3 mb-4" style={{ borderLeft: '4px solid var(--oro-500)' }}>
                  <label className="fw-semibold mb-2"><i className="bi bi-magic texto-oro me-1" />Reserva en una frase</label>
                  <div className="d-flex gap-2">
                    <input
                      className="control"
                      placeholder='Ej: "la piscina el sábado a las 3 pm por 2 horas para 4 personas"'
                      value={frase}
                      onChange={(e) => setFrase(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && interpretar()}
                    />
                    <button type="button" className="btn-oro" onClick={interpretar} disabled={interpretando}>
                      {interpretando ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-stars" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Formulario de reserva (POST /api/reservas) */}
              <form className="tarjeta p-4" onSubmit={enviar}>
                <h5 className="fw-bold mb-1"><i className="bi bi-calendar-plus texto-marca me-2" />Nueva reserva</h5>
                <p className="texto-tenue small mb-3"><i className="bi bi-person-check me-1" />Reservas como <strong>{usuario.nombres}</strong></p>

                <Campo etiqueta="Espacio" icono="bi-door-open" error={errores.espacioId}>
                  <Selector name="espacioId" value={form.espacioId} onChange={cambiar} invalido={errores.espacioId}>
                    <option value="">Selecciona un espacio…</option>
                    {espacios.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.nombre} (aforo {e.aforo}{e.compartible ? ', compartido' : ''})
                      </option>
                    ))}
                  </Selector>
                </Campo>

                {espacioSel?.compartible && (
                  <div className="chip mb-3"><i className="bi bi-people-fill" />Este espacio es compartido: puedes coincidir con otros residentes mientras haya cupo.</div>
                )}

                <div className="row">
                  <div className="col-6">
                    <Campo etiqueta="Fecha" icono="bi-calendar-event" error={errores.fecha}>
                      <Entrada type="date" name="fecha" min={hoyISO()} value={form.fecha} onChange={cambiar} invalido={errores.fecha} />
                    </Campo>
                  </div>
                  <div className="col-3 col-6">
                    <Campo etiqueta="Duración (h)" icono="bi-hourglass">
                      <Selector name="tiempo" value={form.tiempo} onChange={cambiar}>
                        {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} h</option>)}
                      </Selector>
                    </Campo>
                  </div>
                  <div className="col-3 col-6">
                    <Campo etiqueta="Personas" icono="bi-people" error={errores.personas}>
                      <Entrada type="number" name="personas" min="1" value={form.personas} onChange={cambiar} invalido={errores.personas} />
                    </Campo>
                  </div>
                </div>

                {/* Disponibilidad en vivo */}
                <div className="tarjeta p-3 mb-3" style={{ background: 'var(--superficie-2)' }}>
                  <CalendarioDisponibilidad
                    espacioId={form.espacioId}
                    fecha={form.fecha}
                    duracion={form.tiempo}
                    horaElegida={form.hora}
                    alElegir={(h) => { setForm((f) => ({ ...f, hora: h })); setErrores((e) => ({ ...e, hora: undefined })) }}
                  />
                  {errores.hora && <div className="ayuda-error mt-2"><i className="bi bi-exclamation-circle" />{errores.hora}</div>}
                </div>

                {espacioSel?.alAireLibre && <div className="mb-3"><ClimaZona fecha={form.fecha} /></div>}

                <Campo etiqueta="Notas (opcional)">
                  <Area name="notas" rows="2" placeholder="Motivo o comentarios…" value={form.notas} onChange={cambiar} />
                </Campo>

                <button className="btn-marca w-100" disabled={registrar.isPending}>
                  {registrar.isPending ? <><span className="spinner-border spinner-border-sm me-2" />Confirmando…</> : <><i className="bi bi-check2-circle me-1" />Confirmar reserva</>}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Historial: solo las reservas del usuario (o todas si es admin) */}
        <div className="col-lg-6">
          <div className="tarjeta p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">{esAdmin ? 'Todas las reservas' : 'Mis reservas'}</h5>
              <span className="chip-neutro chip">{reservas.length}</span>
            </div>
            <AvisoRespaldo origen={reservasQ.data?.origen} />

            {!autenticado ? (
              <EstadoVacio icono="bi-person-lock" titulo="Inicia sesión">Entra para ver tu historial de reservas.</EstadoVacio>
            ) : reservasQ.isLoading ? (
              <CargandoFilas />
            ) : reservasQ.isError ? (
              <EstadoError error={reservasQ.error} alReintentar={reservasQ.refetch} />
            ) : reservas.length === 0 ? (
              <EstadoVacio icono="bi-calendar-x" titulo="Sin reservas todavía">Crea la primera con el formulario.</EstadoVacio>
            ) : (
              <div className="d-flex flex-column gap-2" style={{ maxHeight: 620, overflowY: 'auto' }}>
                {reservas.map((r) => (
                  <div key={r.id} className="tarjeta p-3 aparecer">
                    <div className="d-flex justify-content-between align-items-start gap-2">
                      <div>
                        <div className="fw-bold">{r.espacioNombre}</div>
                        <div className="texto-suave small">{fechaBonita(r.fecha)} · {rangoHoras(r.fecha, r.tiempo)}</div>
                        <div className="texto-tenue small">
                          {esAdmin && <><i className="bi bi-person me-1" />{r.usuarioNombre} · </>}
                          <i className="bi bi-people me-1" />{r.personas}
                        </div>
                      </div>
                      <div className="text-end">
                        <span className={`estado-badge estado-${r.estado}`}>{etiquetaEstado(r.estado)}</span>
                        {r.codigoAcceso && <div className="mono texto-tenue mt-1" style={{ fontSize: '.8rem' }}>{r.codigoAcceso}</div>}
                      </div>
                    </div>
                    <div className="d-flex gap-2 mt-2">
                      <button className="btn-fantasma" onClick={() => setPase(r)}><i className="bi bi-qr-code me-1" />Pase</button>
                      {esAdmin && r.estado !== 'CONFIRMADA' && <button className="btn-fantasma" onClick={() => cambiarEstado.mutate({ id: r.id, estado: 'CONFIRMADA' })}><i className="bi bi-check2 me-1" />Confirmar</button>}
                      {r.estado !== 'CANCELADA' && <button className="btn-fantasma text-warning" onClick={() => cambiarEstado.mutate({ id: r.id, estado: 'CANCELADA' })}><i className="bi bi-slash-circle me-1" />Cancelar</button>}
                      <button className="btn-fantasma text-danger ms-auto" onClick={() => eliminar.mutate(r.id)}><i className="bi bi-trash" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {pase && <PaseReserva reserva={pase} alCerrar={() => setPase(null)} />}
    </div>
  )
}
