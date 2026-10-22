import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useTema } from '../contexto/TemaContexto.jsx'
import { useSesion } from '../contexto/SesionContexto.jsx'

export default function NavBar() {
  const { tema, alternar } = useTema()
  const { usuario, autenticado, esAdmin, cerrar } = useSesion()
  const [abierto, setAbierto] = useState(false)       // menú móvil
  const [menuUsuario, setMenuUsuario] = useState(false) // dropdown usuario
  const [busqueda, setBusqueda] = useState('')
  const navegar = useNavigate()
  const menuRef = useRef(null)

  // Enlaces: "Residentes" solo para administradores (tareas 6 y 7).
  const enlaces = [
    { a: '/', texto: 'Inicio', icono: 'bi-house', visible: true },
    { a: '/espacios', texto: 'Espacios', icono: 'bi-grid-3x3-gap', visible: true },
    { a: '/reservas', texto: 'Reservas', icono: 'bi-calendar-check', visible: true },
    { a: '/usuarios', texto: 'Residentes', icono: 'bi-people', visible: esAdmin },
    { a: '/porteria', texto: 'Portería', icono: 'bi-qr-code-scan', visible: true },
  ].filter((e) => e.visible)

  // Cierra el dropdown del usuario al hacer clic fuera.
  useEffect(() => {
    const fuera = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuUsuario(false) }
    document.addEventListener('mousedown', fuera)
    return () => document.removeEventListener('mousedown', fuera)
  }, [])

  const salir = () => {
    cerrar()
    setMenuUsuario(false)
    navegar('/')
  }

  const buscar = (e) => {
    e.preventDefault()
    const q = busqueda.trim()
    navegar(q ? `/espacios?q=${encodeURIComponent(q)}` : '/espacios')
    setAbierto(false)
  }

  return (
    <nav className="navbar-paseo vidrio">
      <div className="contenedor d-flex align-items-center gap-3 py-2">
        <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
          <span className="marca-logo"><i className="bi bi-buildings" /></span>
          <span className="d-none d-sm-block">
            <strong className="d-block" style={{ lineHeight: 1 }}>Paseo de San Francisco</strong>
            <small className="texto-tenue" style={{ fontSize: '.72rem' }}>Reservas de zonas comunes</small>
          </span>
        </Link>

        <div className="d-none d-lg-flex align-items-center gap-4 ms-2">
          {enlaces.map((e) => (
            <NavLink
              key={e.a}
              to={e.a}
              end={e.a === '/'}
              className={({ isActive }) => `nav-enlace ${isActive ? 'activo' : ''}`}
            >
              <i className={`bi ${e.icono} me-1`} />{e.texto}
            </NavLink>
          ))}
        </div>

        {/* Barra de búsqueda real (tarea 2) */}
        <form className="barra-busqueda d-none d-md-flex ms-auto" onSubmit={buscar} role="search">
          <i className="bi bi-search" />
          <input
            type="search"
            placeholder="Buscar espacios…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar espacios"
          />
          {busqueda && (
            <button type="button" className="limpiar" onClick={() => setBusqueda('')} aria-label="Limpiar">
              <i className="bi bi-x" />
            </button>
          )}
        </form>

        <div className="d-flex align-items-center gap-2 ms-md-2 ms-auto">
          <button className="btn-fantasma" onClick={alternar} title="Cambiar tema" aria-label="Cambiar tema">
            <i className={`bi ${tema === 'oscuro' ? 'bi-sun' : 'bi-moon-stars'}`} />
          </button>

          {autenticado ? (
            <div className="position-relative" ref={menuRef}>
              <button className="btn-contorno d-flex align-items-center gap-2" onClick={() => setMenuUsuario((v) => !v)}>
                <i className="bi bi-person-circle" />
                <span className="d-none d-sm-inline">{usuario.nombres?.split(' ')[0]}</span>
                <i className={`bi bi-chevron-${menuUsuario ? 'up' : 'down'}`} style={{ fontSize: '.75rem' }} />
              </button>
              {menuUsuario && (
                <div className="menu-usuario tarjeta aparecer">
                  <div className="px-3 py-2 border-bottom" style={{ borderColor: 'var(--borde)' }}>
                    <div className="fw-semibold">{usuario.nombres}</div>
                    <div className="texto-tenue" style={{ fontSize: '.78rem' }}>
                      {esAdmin ? 'Administrador' : 'Residente'}
                    </div>
                  </div>
                  <Link className="menu-item" to="/reservas" onClick={() => setMenuUsuario(false)}>
                    <i className="bi bi-calendar-check me-2" />Mis reservas
                  </Link>
                  {esAdmin && (
                    <Link className="menu-item" to="/panel" onClick={() => setMenuUsuario(false)}>
                      <i className="bi bi-speedometer2 me-2" />Panel
                    </Link>
                  )}
                  <button className="menu-item text-danger" onClick={salir}>
                    <i className="bi bi-box-arrow-right me-2" />Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/registro" className="btn-contorno d-none d-sm-inline-flex"><i className="bi bi-person-plus me-1" />Crear cuenta</Link>
              <Link to="/entrar" className="btn-marca"><i className="bi bi-box-arrow-in-right me-1" />Entrar</Link>
            </>
          )}

          <button className="btn-fantasma d-lg-none" onClick={() => setAbierto((v) => !v)} aria-label="Menú">
            <i className="bi bi-list fs-4" />
          </button>
        </div>
      </div>

      {abierto && (
        <div className="d-lg-none contenedor pb-3 d-flex flex-column gap-1 aparecer">
          <form className="barra-busqueda d-flex d-md-none mb-2" onSubmit={buscar} role="search">
            <i className="bi bi-search" />
            <input type="search" placeholder="Buscar espacios…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </form>
          {enlaces.map((e) => (
            <NavLink
              key={e.a}
              to={e.a}
              end={e.a === '/'}
              onClick={() => setAbierto(false)}
              className={({ isActive }) => `nav-enlace py-2 ${isActive ? 'activo' : ''}`}
            >
              <i className={`bi ${e.icono} me-2`} />{e.texto}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  )
}
