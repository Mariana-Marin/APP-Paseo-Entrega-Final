import { Link } from 'react-router-dom'
import { useEspacios, useReservas, useUsuarios } from '../hooks/usarDatos.js'
import MapaUnidad from '../componentes/MapaUnidad.jsx'
import Galeria from '../componentes/Galeria.jsx'
import { iaDisponible } from '../servicios/iaGemini.js'
import { urlFoto } from '../utilidades/formato.js'

const FONDO = urlFoto('img/aerea.jpg')

function Estadistica({ num, etiqueta }) {
  return (
    <div className="text-center px-3">
      <div className="stat-num">{num}</div>
      <div className="stat-lbl">{etiqueta}</div>
    </div>
  )
}

export default function Inicio() {
  const espacios = useEspacios().data?.datos ?? []
  const reservas = useReservas().data?.datos ?? []
  const usuarios = useUsuarios().data?.datos ?? []

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="hero-media kenburns" style={{ backgroundImage: `url(${FONDO})` }} />
        <div className="contenedor hero-contenido">
          <div style={{ maxWidth: 680 }}>
            <span className="chip chip-oro mb-3"><i className="bi bi-geo-alt" /> Sabaneta, Antioquia</span>
            <h1 className="titulo-display" style={{ fontSize: 'clamp(2.2rem,6vw,4rem)' }}>
              Tu unidad, <span className="texto-oro">a un toque</span> de distancia
            </h1>
            <p className="lead mb-4" style={{ color: 'rgba(234,255,245,.9)' }}>
              Reserva la piscina, el salón social, el gimnasio o la zona BBQ de Paseo de San Francisco.
              Disponibilidad en vivo, pase con QR y un conserje con inteligencia artificial.
            </p>
            <div className="d-flex flex-wrap gap-2 mb-4">
              <Link to="/reservas" className="btn-oro btn-lg"><i className="bi bi-calendar-plus me-2" />Reservar ahora</Link>
              <Link to="/espacios" className="btn-contorno btn-lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.5)' }}>
                <i className="bi bi-grid-3x3-gap me-2" />Ver espacios
              </Link>
            </div>
            <div className="hero-vidrio d-inline-flex p-3 gap-2">
              <Estadistica num={espacios.length} etiqueta="Zonas comunes" />
              <div style={{ width: 1, background: 'rgba(255,255,255,.2)' }} />
              <Estadistica num={reservas.length} etiqueta="Reservas" />
              <div style={{ width: 1, background: 'rgba(255,255,255,.2)' }} />
              <Estadistica num={usuarios.length} etiqueta="Residentes" />
            </div>
          </div>
        </div>
      </section>

      {/* Mapa vivo */}
      <section className="seccion">
        <div className="contenedor">
          <div className="text-center mb-4">
            <span className="chip mb-2"><i className="bi bi-broadcast" /> En vivo</span>
            <h2 className="titulo-display" style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)' }}>Mapa de la unidad</h2>
            <p className="texto-suave">Mira qué zonas están libres en este momento y reserva con un clic.</p>
          </div>
          <MapaUnidad />
        </div>
      </section>

      {/* Galería real de la unidad */}
      <section className="seccion" style={{ paddingTop: 0 }}>
        <div className="contenedor">
          <div className="text-center mb-4">
            <span className="chip mb-2"><i className="bi bi-images" /> Galería</span>
            <h2 className="titulo-display" style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)' }}>Conoce Paseo de San Francisco</h2>
            <p className="texto-suave">Fotos reales de las zonas comunes de la unidad. Toca una imagen para ampliarla.</p>
          </div>
          <Galeria />
        </div>
      </section>

      {/* Franja de confianza con foto de la portería */}
      <section className="seccion" style={{ paddingTop: 0 }}>
        <div className="contenedor">
          <div className="franja-imagen">
            <img src={urlFoto('img/porteria.jpg')} alt="Portería de Paseo de San Francisco" loading="lazy" />
            <div className="velo" />
            <div className="texto" style={{ maxWidth: 560 }}>
              <span className="chip chip-oro mb-2"><i className="bi bi-shield-check" /> Acceso seguro</span>
              <h3 className="titulo-display" style={{ color: '#fff', fontSize: 'clamp(1.5rem,3.5vw,2.2rem)' }}>
                Portería con verificación de pases
              </h3>
              <p style={{ color: 'rgba(234,255,245,.9)' }}>
                Cada reserva genera un código y un QR que la portería valida al instante.
                Nada de listas en papel ni confusiones en la entrada.
              </p>
              <Link to="/porteria" className="btn-oro"><i className="bi bi-qr-code-scan me-2" />Ir a portería</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="seccion" style={{ paddingTop: 0 }}>
        <div className="contenedor">
          <div className="row g-3">
            {[
              { i: 'bi-lightning-charge', t: 'Reservas en segundos', d: 'Sin filas en portería ni llamadas. Eliges, confirmas y listo.' },
              { i: 'bi-qr-code', t: 'Pase con QR', d: 'Cada reserva genera un código verificable por la portería.' },
              { i: 'bi-people', t: 'Control de aforo', d: 'Cada zona respeta su capacidad y su horario de uso.' },
              { i: 'bi-robot', t: iaDisponible() ? 'Conserje con IA' : 'Asistente Fran', d: 'Fran te ayuda a reservar hablándole en lenguaje natural.' },
            ].map((b) => (
              <div className="col-md-6 col-lg-3" key={b.t}>
                <div className="tarjeta tarjeta-hover p-4 h-100">
                  <div className="metrica p-0 mb-2">
                    <span className="ico" style={{ background: 'color-mix(in srgb, var(--marca-500) 14%, transparent)', color: 'var(--marca-600)' }}>
                      <i className={`bi ${b.i}`} />
                    </span>
                  </div>
                  <h6 className="fw-bold">{b.t}</h6>
                  <p className="texto-suave mb-0" style={{ fontSize: '.92rem' }}>{b.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="seccion" style={{ paddingTop: 0 }}>
        <div className="contenedor">
          <div className="tarjeta p-4 p-md-5 text-center" style={{ background: 'linear-gradient(135deg, var(--marca-700), var(--marca-900))', color: '#fff' }}>
            <h2 className="titulo-display" style={{ color: '#fff' }}>¿Listo para tu próxima reunión?</h2>
            <p className="mb-4" style={{ color: 'rgba(234,255,245,.85)' }}>Reserva tu zona común en menos de un minuto.</p>
            <Link to="/reservas" className="btn-oro btn-lg"><i className="bi bi-calendar-heart me-2" />Hacer una reserva</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
