/** Campo de texto controlado con etiqueta, icono opcional y mensaje de error. */
export function Campo({ etiqueta, icono, error, children, ayuda }) {
  return (
    <div className="campo">
      {etiqueta && <label>{etiqueta}</label>}
      <div className={icono ? 'campo-icono' : undefined}>
        {icono && <i className={`bi ${icono}`} />}
        {children}
      </div>
      {ayuda && !error && <div className="texto-tenue mt-1" style={{ fontSize: '.8rem' }}>{ayuda}</div>}
      {error && (
        <div className="ayuda-error">
          <i className="bi bi-exclamation-circle" />
          {error}
        </div>
      )}
    </div>
  )
}

export function Entrada({ invalido, ...props }) {
  return <input className={`control ${invalido ? 'invalido' : ''}`} {...props} />
}

export function Area({ invalido, ...props }) {
  return <textarea className={`control ${invalido ? 'invalido' : ''}`} {...props} />
}

export function Selector({ invalido, children, ...props }) {
  return (
    <select className={`control ${invalido ? 'invalido' : ''}`} {...props}>
      {children}
    </select>
  )
}
