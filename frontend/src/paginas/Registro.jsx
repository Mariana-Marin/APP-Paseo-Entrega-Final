import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Campo, Entrada } from '../componentes/Campo.jsx'
import { useSesion } from '../contexto/SesionContexto.jsx'
import { registrarUsuario, iniciarSesion } from '../servicios/servicioUsuarios.js'
import { mensajeDeError } from '../servicios/clienteApi.js'
import { urlFoto } from '../utilidades/formato.js'

const IMG = urlFoto('img/edificios.jpg')
const VACIO = { nombres: '', correo: '', contrasena: '', apartamento: '', telefono: '' }

/**
 * Registro PÚBLICO de residentes (accesible sin sesión). A diferencia del
 * módulo de administración (/usuarios), aquí el rol es siempre RESIDENTE y,
 * tras crear la cuenta, se inicia sesión automáticamente.
 */
export default function Registro() {
  const navegar = useNavigate()
  const { iniciar } = useSesion()
  const [form, setForm] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const [cargando, setCargando] = useState(false)

  const cambiar = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const validar = () => {
    const e = {}
    if (form.nombres.trim().length < 3) e.nombres = 'Mínimo 3 caracteres'
    if (!/^\S+@\S+\.\S+$/.test(form.correo)) e.correo = 'Ingresa un correo válido'
    if (form.contrasena.length < 6) e.contrasena = 'Mínimo 6 caracteres'
    return e
  }

  const enviar = async (e) => {
    e.preventDefault()
    const errs = validar()
    setErrores(errs)
    if (Object.keys(errs).length) return

    setCargando(true)
    try {
      await registrarUsuario({ ...form, rol: 'RESIDENTE' })
      // Iniciar sesión automáticamente con las credenciales recién creadas.
      const usuario = await iniciarSesion({ correo: form.correo, contrasena: form.contrasena })
      iniciar(usuario)
      toast.success(`¡Cuenta creada! Bienvenido, ${usuario.nombres.split(' ')[0]}`)
      navegar('/reservas')
    } catch (err) {
      toast.error(mensajeDeError(err, 'No se pudo crear la cuenta'))
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="contenedor seccion">
      <div className="row g-0 tarjeta overflow-hidden" style={{ maxWidth: 960, margin: '0 auto' }}>
        <div className="col-lg-5 d-none d-lg-block position-relative" style={{ minHeight: 540 }}>
          <div className="hero-media" style={{ backgroundImage: `url(${IMG})` }} />
          <div className="position-relative p-5 d-flex flex-column justify-content-end h-100" style={{ color: '#fff' }}>
            <span className="marca-logo mb-3"><i className="bi bi-buildings" /></span>
            <h3 className="fw-bold">Únete a Paseo de San Francisco</h3>
            <p style={{ color: 'rgba(234,255,245,.85)' }}>Crea tu cuenta de residente y reserva las zonas comunes en segundos.</p>
          </div>
        </div>
        <div className="col-lg-7 p-4 p-md-5">
          <h3 className="fw-bold mb-1">Crear cuenta</h3>
          <p className="texto-suave mb-4">Regístrate como residente para empezar a reservar.</p>
          <form onSubmit={enviar}>
            <Campo etiqueta="Nombre completo" icono="bi-person" error={errores.nombres}>
              <Entrada name="nombres" placeholder="Ej: Mariana Marín" value={form.nombres} onChange={cambiar} invalido={errores.nombres} />
            </Campo>
            <Campo etiqueta="Correo" icono="bi-envelope" error={errores.correo}>
              <Entrada type="email" name="correo" placeholder="correo@ejemplo.com" value={form.correo} onChange={cambiar} invalido={errores.correo} />
            </Campo>
            <Campo etiqueta="Contraseña" icono="bi-lock" error={errores.contrasena} ayuda="Mínimo 6 caracteres. Se guarda cifrada.">
              <Entrada type="password" name="contrasena" placeholder="••••••" value={form.contrasena} onChange={cambiar} invalido={errores.contrasena} />
            </Campo>
            <div className="row">
              <div className="col-7">
                <Campo etiqueta="Apartamento (opcional)" icono="bi-house">
                  <Entrada name="apartamento" placeholder="T2-504" value={form.apartamento} onChange={cambiar} />
                </Campo>
              </div>
              <div className="col-5">
                <Campo etiqueta="Teléfono (opcional)" icono="bi-telephone">
                  <Entrada name="telefono" placeholder="300 000 0000" value={form.telefono} onChange={cambiar} />
                </Campo>
              </div>
            </div>
            <button className="btn-marca w-100 mt-1" disabled={cargando}>
              {cargando ? <><span className="spinner-border spinner-border-sm me-2" />Creando cuenta…</> : <><i className="bi bi-person-check me-1" />Crear cuenta</>}
            </button>
          </form>
          <p className="texto-suave small mt-3 mb-0">¿Ya tienes cuenta? <Link to="/entrar">Inicia sesión</Link>.</p>
        </div>
      </div>
    </div>
  )
}
