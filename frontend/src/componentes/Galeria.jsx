import { useEffect, useState } from 'react'
import { urlFoto } from '../utilidades/formato.js'

// Galería de fotos reales de Paseo de San Francisco con visor a pantalla.
const FOTOS = [
  { src: 'img/aerea.jpg', tit: 'Vista aérea', sub: 'Piscina y cancha múltiple', clase: 'galeria-grande' },
  { src: 'img/piscina.jpg', tit: 'Piscina', sub: 'Zona húmeda' },
  { src: 'img/gimnasio.jpg', tit: 'Gimnasio', sub: 'Cardio y fuerza' },
  { src: 'img/cancha.jpg', tit: 'Cancha', sub: 'Microfútbol', clase: 'galeria-ancho' },
  { src: 'img/piscina-2.jpg', tit: 'Solárium', sub: 'Descanso al sol' },
  { src: 'img/edificios.jpg', tit: 'Las torres', sub: 'Sabaneta, Antioquia' },
]

export default function Galeria() {
  const [abierta, setAbierta] = useState(null)

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && setAbierta(null)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [])

  return (
    <>
      <div className="galeria">
        {FOTOS.map((f) => (
          <figure
            key={f.src}
            className={`galeria-item ${f.clase ?? ''}`}
            onClick={() => setAbierta(f)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setAbierta(f)}
          >
            <img src={urlFoto(f.src)} alt={f.tit} loading="lazy" />
            <figcaption className="galeria-cap">
              <span className="tit">{f.tit}</span>
              <span className="sub">{f.sub}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      {abierta && (
        <div className="visor-fondo" onClick={() => setAbierta(null)}>
          <button className="visor-cerrar" aria-label="Cerrar"><i className="bi bi-x-lg" /></button>
          <img src={urlFoto(abierta.src)} alt={abierta.tit} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  )
}
