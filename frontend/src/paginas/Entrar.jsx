import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Campo, Entrada } from '../componentes/Campo.jsx'
import { useSesion } from '../contexto/SesionContexto.jsx'
import { iniciarSesion } from '../servicios/servicioUsuarios.js'
import { mensajeDeError } from '../servicios/clienteApi.js'
import { urlFoto } from '../utilidades/formato.js'

const IMG = urlFoto('img/porteria.jpg')

export default function Entrar() {
  const navegar = useNavigate()
  const { iniciar } = useSesion()
  const [form, setForm] = useState({ correo: '', contrasena: '' })
  const [cargando, setCargando] = useState(false)

  const cambiar = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const enviar = async (e) => {
    e.preventDefault()
    setCargando(true)
    try {
      const usuario = await iniciarSesion(form)
      iniciar(usuario)
      toast.success(`¡Bienvenido, ${usuario.nombres.split(' ')[0]}!`)
      navegar(usuario.rol === 'ADMINISTRADOR' ? '/panel' : '/reservas')
    } catch (err) {
      toast.error(mensajeDeError(err, 'No se pudo iniciar sesión'))
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="contenedor seccion">
      <div className="row g-0 tarjeta overflow-hidden" style={{ maxWidth: 920, margin: '0 auto' }}>
        <div className="col-lg-6 d-none d-lg-block position-relative" style={{ minHeight: 480 }}>
          <div className="hero-media" style={{ backgroundImage: `url(${IMG})` }} />
          <div className="position-relative p-5 d-flex flex-column justify-content-end h-100" style={{ color: '#fff' }}>
            <span className="marca-logo mb-3"><i className="bi bi-buildings" /></span>
            <h3 className="fw-bold">Paseo de San Francisco</h3>
            <p style={{ color: 'rgba(234,255,245,.85)' }}>Gestiona y reserva las zonas comunes de tu unidad residencial.</p>
          </div>
        </div>
        <div className="col-lg-6 p-4 p-md-5">
          <h3 className="fw-bold mb-1">Iniciar sesión</h3>
          <p className="texto-suave mb-4">Entra con tu correo de residente.</p>
          <form onSubmit={enviar}>
            <Campo etiqueta="Correo" icono="bi-envelope">
              <Entrada type="email" name="correo" placeholder="correo@ejemplo.com" value={form.correo} onChange={cambiar} required />
            </Campo>
            <Campo etiqueta="Contraseña" icono="bi-lock">
              <Entrada type="password" name="contrasena" placeholder="••••••" value={form.contrasena} onChange={cambiar} required />
            </Campo>
            <button className="btn-marca w-100" disabled={cargando}>
              {cargando ? <><span className="spinner-border spinner-border-sm me-2" />Entrando…</> : <><i className="bi bi-box-arrow-in-right me-1" />Entrar</>}
            </button>
          </form>
          <div className="tarjeta p-3 mt-4" style={{ background: 'var(--superficie-2)' }}>
            <div className="texto-tenue small"><i className="bi bi-info-circle me-1" />Demo: <strong>admin@paseosanfrancisco.co</strong> / <strong>paseo2026</strong></div>
          </div>
          <p className="texto-suave small mt-3 mb-0">¿Aún no tienes cuenta? <Link to="/registro">Regístrate aquí</Link>.</p>
        </div>
      </div>
    </div>
  )
}
