import { mensajeDeError } from '../servicios/clienteApi.js'

/** Esqueletos de carga en forma de rejilla de tarjetas. */
export function CargandoTarjetas({ cantidad = 6, altura = 260 }) {
  return (
    <div className="grid-auto">
      {Array.from({ length: cantidad }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: altura }} />
      ))}
    </div>
  )
}

export function CargandoFilas({ cantidad = 5 }) {
  return (
    <div className="d-flex flex-column gap-2">
      {Array.from({ length: cantidad }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 56 }} />
      ))}
    </div>
  )
}

export function EstadoError({ error, alReintentar }) {
  return (
    <div className="vacio">
      <i className="bi bi-wifi-off" />
      <h5 className="fw-bold">No pudimos cargar la información</h5>
      <p className="texto-suave mb-3">{mensajeDeError(error)}</p>
      {alReintentar && (
        <button className="btn-contorno" onClick={alReintentar}>
          <i className="bi bi-arrow-clockwise me-1" /> Reintentar
        </button>
      )}
    </div>
  )
}

export function EstadoVacio({ icono = 'bi-inbox', titulo, children }) {
  return (
    <div className="vacio">
      <i className={`bi ${icono}`} />
      <h5 className="fw-bold">{titulo}</h5>
      {children && <p className="texto-suave mb-0">{children}</p>}
    </div>
  )
}

/** Aviso de que los datos vienen del respaldo de Firestore (backend caído). */
export function AvisoRespaldo({ origen }) {
  if (origen !== 'firestore') return null
  return (
    <div className="chip chip-oro mb-3">
      <i className="bi bi-cloud-check" /> Datos leídos directamente de Firebase (servidor en reposo)
    </div>
  )
}
