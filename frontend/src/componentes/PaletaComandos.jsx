import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTema } from '../contexto/TemaContexto.jsx'

/**
 * Paleta de comandos estilo Ctrl+K: navegación rápida y acciones del sitio.
 */
export default function PaletaComandos({ abierto, alCerrar }) {
  const navegar = useNavigate()
  const { alternar } = useTema()
  const [texto, setTexto] = useState('')
  const [indice, setIndice] = useState(0)
  const inputRef = useRef(null)

  const comandos = useMemo(
    () => [
      { id: 'inicio', icono: 'bi-house', texto: 'Ir al inicio', accion: () => navegar('/') },
      { id: 'espacios', icono: 'bi-grid-3x3-gap', texto: 'Ver espacios', accion: () => navegar('/espacios') },
      { id: 'nueva-reserva', icono: 'bi-calendar-plus', texto: 'Nueva reserva', accion: () => navegar('/reservas') },
      { id: 'reservas', icono: 'bi-calendar-check', texto: 'Ver reservas', accion: () => navegar('/reservas') },
      { id: 'usuarios', icono: 'bi-people', texto: 'Residentes', accion: () => navegar('/usuarios') },
      { id: 'porteria', icono: 'bi-qr-code-scan', texto: 'Verificar pase (portería)', accion: () => navegar('/porteria') },
      { id: 'panel', icono: 'bi-speedometer2', texto: 'Panel de administración', accion: () => navegar('/panel') },
      { id: 'tema', icono: 'bi-circle-half', texto: 'Cambiar tema claro/oscuro', accion: alternar },
    ],
    [navegar, alternar],
  )

  const filtrados = comandos.filter((c) => c.texto.toLowerCase().includes(texto.toLowerCase()))

  useEffect(() => {
    if (abierto) {
      setTexto(''); setIndice(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [abierto])

  if (!abierto) return null

  const ejecutar = (c) => { c.accion(); alCerrar() }

  const alTeclear = (e) => {
    if (e.key === 'Escape') return alCerrar()
    if (e.key === 'ArrowDown') { e.preventDefault(); setIndice((i) => Math.min(i + 1, filtrados.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setIndice((i) => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && filtrados[indice]) ejecutar(filtrados[indice])
  }

  return (
    <div className="cmdk-fondo" onClick={alCerrar}>
      <div className="cmdk-caja vidrio" onClick={(e) => e.stopPropagation()}>
        <div className="d-flex align-items-center gap-2 p-3 border-bottom" style={{ borderColor: 'var(--borde)' }}>
          <i className="bi bi-search texto-suave" />
          <input
            ref={inputRef}
            className="control border-0 p-0"
            style={{ background: 'transparent' }}
            placeholder="Buscar acción o página…"
            value={texto}
            onChange={(e) => { setTexto(e.target.value); setIndice(0) }}
            onKeyDown={alTeclear}
          />
          <kbd style={{ fontSize: '.7rem' }}>Esc</kbd>
        </div>
        <div className="p-2" style={{ maxHeight: 340, overflowY: 'auto' }}>
          {filtrados.length === 0 ? (
            <div className="texto-tenue text-center py-4">Sin resultados</div>
          ) : (
            filtrados.map((c, i) => (
              <div
                key={c.id}
                className={`cmdk-item ${i === indice ? 'activo' : ''}`}
                onMouseEnter={() => setIndice(i)}
                onClick={() => ejecutar(c)}
              >
                <i className={`bi ${c.icono} texto-marca`} />
                <span>{c.texto}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
