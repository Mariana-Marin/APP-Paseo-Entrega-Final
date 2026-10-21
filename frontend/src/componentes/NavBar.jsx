import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useTema } from '../contexto/TemaContexto.jsx'
import { useSesion } from '../contexto/SesionContexto.jsx'

const enlaces = [
  { a: '/', texto: 'Inicio', icono: 'bi-house' },
  { a: '/espacios', texto: 'Espacios', icono: 'bi-grid-3x3-gap' },
  { a: '/reservas', texto: 'Reservas', icono: 'bi-calendar-check' },
  { a: '/usuarios', texto: 'Residentes', icono: 'bi-people' },
  { a: '/porteria', texto: 'Portería', icono: 'bi-qr-code-scan' },
]

export default function NavBar({ onAbrirComandos }) {
  const { tema, alternar } = useTema()
  const { usuario, autenticado, cerrar } = useSesion()
  const [abierto, setAbierto] = useState(false)
  const navegar = useNavigate()

  const salir = () => {
    cerrar()
    navegar('/')
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

        <div className="d-none d-lg-flex align-items-center gap-4 ms-3">
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

        <div className="ms-auto d-flex align-items-center gap-2">
          <button className="btn-fantasma d-none d-md-inline-flex align-items-center gap-1" onClick={onAbrirComandos} title="Buscar (Ctrl+K)">
            <i className="bi bi-search" /><kbd className="d-none d-xl-inline" style={{ fontSize: '.7rem' }}>Ctrl K</kbd>
          </button>
          <button className="btn-fantasma" onClick={alternar} title="Cambiar tema" aria-label="Cambiar tema">
            <i className={`bi ${tema === 'oscuro' ? 'bi-sun' : 'bi-moon-stars'}`} />
          </button>

          {autenticado ? (
            <div className="dropdown">
              <button className="btn-contorno dropdown-toggle d-flex align-items-center gap-2" data-bs-toggle="dropdown">
                <i className="bi bi-person-circle" />
                <span className="d-none d-sm-inline">{usuario.nombres?.split(' ')[0]}</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><Link className="dropdown-item" to="/panel"><i className="bi bi-speedometer2 me-2" />Panel</Link></li>
                <li><Link className="dropdown-item" to="/reservas"><i className="bi bi-calendar-check me-2" />Mis reservas</Link></li>
                <li><hr className="dropdown-divider" /></li>
                <li><button className="dropdown-item text-danger" onClick={salir}><i className="bi bi-box-arrow-right me-2" />Salir</button></li>
              </ul>
            </div>
          ) : (
            <Link to="/entrar" className="btn-marca"><i className="bi bi-box-arrow-in-right me-1" />Entrar</Link>
          )}

          <button className="btn-fantasma d-lg-none" onClick={() => setAbierto((v) => !v)} aria-label="Menú">
            <i className="bi bi-list fs-4" />
          </button>
        </div>
      </div>

      {abierto && (
        <div className="d-lg-none contenedor pb-3 d-flex flex-column gap-1 aparecer">
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
