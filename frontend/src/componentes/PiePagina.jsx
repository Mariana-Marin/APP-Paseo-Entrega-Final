import { Link } from 'react-router-dom'
import { API_URL } from '../servicios/clienteApi.js'

export default function PiePagina() {
  return (
    <footer className="seccion" style={{ paddingBottom: '2rem' }}>
      <div className="contenedor">
        <div className="tarjeta p-4 p-md-5">
          <div className="row g-4">
            <div className="col-lg-5">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="marca-logo"><i className="bi bi-buildings" /></span>
                <strong className="fs-5">Paseo de San Francisco</strong>
              </div>
              <p className="texto-suave mb-3">
                Plataforma de reservas de zonas comunes para la unidad residencial.
                Reserva en segundos, controla el aforo y recibe tu pase de acceso.
              </p>
              <span className="chip"><i className="bi bi-geo-alt" /> Sabaneta, Antioquia · Colombia</span>
            </div>
            <div className="col-6 col-lg-3">
              <h6 className="fw-bold mb-3">Navegación</h6>
              <ul className="list-unstyled d-flex flex-column gap-2 texto-suave">
                <li><Link to="/espacios" className="texto-suave">Espacios</Link></li>
                <li><Link to="/reservas" className="texto-suave">Reservas</Link></li>
                <li><Link to="/usuarios" className="texto-suave">Residentes</Link></li>
                <li><Link to="/porteria" className="texto-suave">Portería</Link></li>
              </ul>
            </div>
            <div className="col-6 col-lg-4">
              <h6 className="fw-bold mb-3">La unidad</h6>
              <ul className="list-unstyled d-flex flex-column gap-2 texto-suave">
                <li><i className="bi bi-clock me-2" />Portería 24/7</li>
                <li><i className="bi bi-shield-check me-2" />Reservas con pase QR</li>
                <li><i className="bi bi-robot me-2" />Asistente con IA (Fran)</li>
              </ul>
            </div>
          </div>
          <hr className="divisor" />
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 texto-tenue" style={{ fontSize: '.85rem' }}>
            <span>© {new Date().getFullYear()} Paseo de San Francisco · Proyecto académico</span>
            <span className="mono">API: {API_URL}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
