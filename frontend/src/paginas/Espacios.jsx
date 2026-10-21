import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useEspacios, useRegistrarEspacio } from '../hooks/usarDatos.js'
import { Campo, Entrada, Area, Selector } from '../componentes/Campo.jsx'
import { CargandoTarjetas, EstadoError, EstadoVacio, AvisoRespaldo } from '../componentes/Estados.jsx'
import { categoria, CATEGORIAS } from '../utilidades/formato.js'
import { iaDisponible, generarDescripcionEspacio } from '../servicios/iaGemini.js'

const VACIO = {
  nombre: '', descripcion: '', foto: '', aforo: '', categoria: '',
  ubicacion: '', horaApertura: 6, horaCierre: 22, alAireLibre: false,
}

function validar(d) {
  const e = {}
  if (d.nombre.trim().length < 3) e.nombre = 'Mínimo 3 caracteres'
  if (d.descripcion.trim().length < 10) e.descripcion = 'Mínimo 10 caracteres'
  if (!d.aforo || Number(d.aforo) <= 0) e.aforo = 'Debe ser mayor a 0'
  if (Number(d.horaCierre) <= Number(d.horaApertura)) e.horaCierre = 'El cierre debe ser mayor a la apertura'
  return e
}

function TarjetaEspacio({ espacio }) {
  const cat = categoria(espacio.categoria)
  const foto = espacio.foto || 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80'
  return (
    <article className="tarjeta tarjeta-hover espacio-card aparecer">
      <div className="espacio-foto">
        <img src={foto} alt={espacio.nombre} loading="lazy" />
        <div className="cinta">
          <span className="chip"><i className={`bi ${cat.icono}`} />{cat.etiqueta}</span>
          {espacio.alAireLibre && <span className="chip chip-oro"><i className="bi bi-sun" />Aire libre</span>}
        </div>
      </div>
      <div className="espacio-cuerpo">
        <h5 className="fw-bold mb-0">{espacio.nombre}</h5>
        <p className="texto-suave mb-0" style={{ fontSize: '.92rem' }}>{espacio.descripcion}</p>
        <div className="d-flex flex-wrap gap-2 mt-1">
          <span className="chip-neutro chip"><i className="bi bi-people" />Aforo {espacio.aforo}</span>
          {espacio.horaApertura != null && (
            <span className="chip-neutro chip"><i className="bi bi-clock" />{String(espacio.horaApertura).padStart(2, '0')}:00–{String(espacio.horaCierre).padStart(2, '0')}:00</span>
          )}
          {espacio.ubicacion && <span className="chip-neutro chip"><i className="bi bi-geo-alt" />{espacio.ubicacion}</span>}
        </div>
        <div className="espacio-pie">
          <Link to={`/reservas?espacio=${espacio.id}`} className="btn-marca"><i className="bi bi-calendar-plus me-1" />Reservar</Link>
        </div>
      </div>
    </article>
  )
}

export default function Espacios() {
  const { data, isLoading, isError, error, refetch } = useEspacios()
  const registrar = useRegistrarEspacio()
  const [form, setForm] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const [mostrarForm, setMostrarForm] = useState(false)
  const [generando, setGenerando] = useState(false)

  const espacios = data?.datos ?? []

  const cambiar = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const describirConIA = async () => {
    if (!form.nombre.trim()) return toast.info('Escribe primero el nombre del espacio')
    setGenerando(true)
    try {
      const texto = await generarDescripcionEspacio({ nombre: form.nombre, categoria: form.categoria, aforo: form.aforo })
      if (texto) {
        setForm((f) => ({ ...f, descripcion: texto }))
        toast.success('Descripción generada con IA')
      }
    } catch {
      toast.error('No se pudo generar la descripción')
    } finally {
      setGenerando(false)
    }
  }

  const enviar = async (e) => {
    e.preventDefault()
    const errs = validar(form)
    setErrores(errs)
    if (Object.keys(errs).length) return
    try {
      await registrar.mutateAsync({
        ...form,
        aforo: Number(form.aforo),
        horaApertura: Number(form.horaApertura),
        horaCierre: Number(form.horaCierre),
      })
      setForm(VACIO)
      setErrores({})
      setMostrarForm(false)
    } catch {
      /* toast lo maneja el hook */
    }
  }

  return (
    <div className="contenedor seccion">
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
        <div>
          <span className="chip mb-2"><i className="bi bi-grid-3x3-gap" /> Módulo de espacios</span>
          <h1 className="titulo-display" style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)' }}>Zonas comunes</h1>
          <p className="texto-suave mb-0">Explora las zonas de la unidad y regístralas con su aforo y horario.</p>
        </div>
        <button className="btn-marca" onClick={() => setMostrarForm((v) => !v)}>
          <i className={`bi ${mostrarForm ? 'bi-x-lg' : 'bi-plus-lg'} me-1`} />
          {mostrarForm ? 'Cerrar formulario' : 'Registrar espacio'}
        </button>
      </div>

      {/* Formulario de registro (POST /api/espacios) */}
      {mostrarForm && (
        <form className="tarjeta p-4 mb-4 aparecer" onSubmit={enviar}>
          <div className="row">
            <div className="col-md-6">
              <Campo etiqueta="Nombre" icono="bi-door-open" error={errores.nombre}>
                <Entrada name="nombre" placeholder="Salón social" value={form.nombre} onChange={cambiar} invalido={errores.nombre} />
              </Campo>
            </div>
            <div className="col-md-3 col-6">
              <Campo etiqueta="Categoría" icono="bi-tag">
                <Selector name="categoria" value={form.categoria} onChange={cambiar}>
                  <option value="">General</option>
                  {Object.entries(CATEGORIAS).map(([k, v]) => <option key={k} value={k}>{v.etiqueta}</option>)}
                </Selector>
              </Campo>
            </div>
            <div className="col-md-3 col-6">
              <Campo etiqueta="Aforo" icono="bi-people" error={errores.aforo}>
                <Entrada type="number" name="aforo" min="1" placeholder="40" value={form.aforo} onChange={cambiar} invalido={errores.aforo} />
              </Campo>
            </div>
          </div>

          <Campo etiqueta="Descripción" error={errores.descripcion}>
            <Area name="descripcion" rows="2" placeholder="Describe el espacio…" value={form.descripcion} onChange={cambiar} invalido={errores.descripcion} />
            {iaDisponible() && (
              <button type="button" className="btn-fantasma mt-1" onClick={describirConIA} disabled={generando}>
                <i className="bi bi-stars me-1" />{generando ? 'Generando…' : 'Redactar con IA'}
              </button>
            )}
          </Campo>

          <div className="row">
            <div className="col-md-6">
              <Campo etiqueta="Foto (URL)" icono="bi-image">
                <Entrada name="foto" placeholder="https://…" value={form.foto} onChange={cambiar} />
              </Campo>
            </div>
            <div className="col-md-6">
              <Campo etiqueta="Ubicación" icono="bi-geo-alt">
                <Entrada name="ubicacion" placeholder="Torre 1 - Terraza" value={form.ubicacion} onChange={cambiar} />
              </Campo>
            </div>
            <div className="col-md-3 col-6">
              <Campo etiqueta="Abre (hora)" icono="bi-sunrise">
                <Entrada type="number" name="horaApertura" min="0" max="23" value={form.horaApertura} onChange={cambiar} />
              </Campo>
            </div>
            <div className="col-md-3 col-6">
              <Campo etiqueta="Cierra (hora)" icono="bi-sunset" error={errores.horaCierre}>
                <Entrada type="number" name="horaCierre" min="1" max="24" value={form.horaCierre} onChange={cambiar} invalido={errores.horaCierre} />
              </Campo>
            </div>
            <div className="col-md-6 d-flex align-items-center">
              <label className="d-flex align-items-center gap-2 mt-2">
                <input type="checkbox" name="alAireLibre" checked={form.alAireLibre} onChange={cambiar} />
                <span className="fw-semibold">Es una zona al aire libre (muestra el clima)</span>
              </label>
            </div>
          </div>

          <button className="btn-marca mt-2" disabled={registrar.isPending}>
            {registrar.isPending ? <><span className="spinner-border spinner-border-sm me-2" />Guardando…</> : <><i className="bi bi-save me-1" />Guardar espacio</>}
          </button>
        </form>
      )}

      <AvisoRespaldo origen={data?.origen} />

      {isLoading ? (
        <CargandoTarjetas />
      ) : isError ? (
        <EstadoError error={error} alReintentar={refetch} />
      ) : espacios.length === 0 ? (
        <EstadoVacio icono="bi-grid" titulo="Todavía no hay espacios">Registra el primero con el botón de arriba.</EstadoVacio>
      ) : (
        <div className="grid-auto">
          {espacios.map((e) => <TarjetaEspacio key={e.id} espacio={e} />)}
        </div>
      )}
    </div>
  )
}
