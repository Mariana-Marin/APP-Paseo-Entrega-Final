import { Link } from 'react-router-dom'

export default function NoEncontrada() {
  return (
    <div className="contenedor seccion text-center">
      <div className="tarjeta p-5" style={{ maxWidth: 520, margin: '0 auto' }}>
        <i className="bi bi-compass texto-marca" style={{ fontSize: '3.5rem' }} />
        <h1 className="titulo-display mt-3" style={{ fontSize: '2.4rem' }}>Página no encontrada</h1>
        <p className="texto-suave">La ruta que buscas no existe en Paseo de San Francisco.</p>
        <Link to="/" className="btn-marca"><i className="bi bi-house me-1" />Volver al inicio</Link>
      </div>
    </div>
  )
}
