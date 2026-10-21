import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { iaDisponible, crearChatConHerramientas } from '../servicios/iaGemini.js'
import { listarEspacios, obtenerDisponibilidad } from '../servicios/servicioEspacios.js'

const SUGERENCIAS = [
  '¿Qué espacios hay?',
  '¿Está libre la piscina el sábado?',
  'Quiero reservar el salón social',
]

const BIENVENIDA = {
  autor: 'ia',
  texto: '¡Hola! Soy Fran, el conserje de Paseo de San Francisco. Puedo contarte sobre las zonas comunes, mirar disponibilidad y ayudarte a armar una reserva. ¿Qué necesitas?',
}

export default function AsistenteFran() {
  const navegar = useNavigate()
  const disponible = iaDisponible()
  const [abierto, setAbierto] = useState(false)
  const [mensajes, setMensajes] = useState([BIENVENIDA])
  const [texto, setTexto] = useState('')
  const [pensando, setPensando] = useState(false)
  const chatRef = useRef(null)
  const finRef = useRef(null)

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, pensando])

  // Herramientas que el modelo puede invocar (function calling) -> API real.
  const ejecutores = {
    listarEspacios: async () => {
      const { datos } = await listarEspacios()
      return datos.map((e) => ({
        id: e.id, nombre: e.nombre, categoria: e.categoria,
        aforo: e.aforo, horaApertura: e.horaApertura, horaCierre: e.horaCierre,
      }))
    },
    consultarDisponibilidad: async ({ espacioId, fecha }) => obtenerDisponibilidad(espacioId, fecha),
    prepararReserva: async ({ espacioId, fecha, tiempo, personas }) => {
      // No crea nada: prepara el formulario para que el residente confirme.
      const query = new URLSearchParams({ espacio: espacioId })
      navegar(`/reservas?${query.toString()}`)
      setAbierto(false)
      toast.info('Te llevé al formulario de reserva con el espacio elegido. Revisa fecha y hora y confirma.')
      return { preparado: true, espacioId, fecha, tiempo, personas }
    },
  }

  const asegurarChat = async () => {
    if (!chatRef.current) chatRef.current = await crearChatConHerramientas(ejecutores)
    return chatRef.current
  }

  const enviar = async (valor) => {
    const pregunta = (valor ?? texto).trim()
    if (!pregunta || pensando) return
    setMensajes((m) => [...m, { autor: 'yo', texto: pregunta }])
    setTexto('')
    setPensando(true)
    try {
      const chat = await asegurarChat()
      if (!chat) throw new Error('IA no disponible')
      const respuesta = await chat.enviar(pregunta)
      setMensajes((m) => [...m, { autor: 'ia', texto: respuesta || 'Listo.' }])
    } catch (e) {
      setMensajes((m) => [...m, { autor: 'sistema', texto: 'Ups, no pude responder ahora. Revisa la configuración de Firebase/Gemini o intenta de nuevo.' }])
      console.warn(e)
    } finally {
      setPensando(false)
    }
  }

  return (
    <>
      <button className="fran-boton" onClick={() => setAbierto((v) => !v)} aria-label="Abrir asistente Fran" title="Asistente Fran">
        <i className={`bi ${abierto ? 'bi-x-lg' : 'bi-robot'}`} />
        {!abierto && <span className="punto" />}
      </button>

      {abierto && (
        <div className="fran-panel tarjeta aparecer">
          <div className="fran-cabecera">
            <span className="marca-logo" style={{ background: 'rgba(255,255,255,.18)' }}><i className="bi bi-robot" /></span>
            <div>
              <strong className="d-block" style={{ lineHeight: 1 }}>Fran</strong>
              <small style={{ opacity: .85 }}>{disponible ? 'Conserje con IA · en línea' : 'Asistente (IA sin configurar)'}</small>
            </div>
          </div>

          <div className="fran-cuerpo">
            {!disponible && (
              <div className="burbuja burbuja-sistema">
                El asistente con IA necesita la configuración de Firebase (variables VITE_FIREBASE_*) y Gemini.
                Cuando se configuren, Fran podrá responder y ayudarte a reservar.
              </div>
            )}
            {mensajes.map((m, i) => (
              <div key={i} className={`burbuja ${m.autor === 'yo' ? 'burbuja-yo' : m.autor === 'sistema' ? 'burbuja-sistema' : 'burbuja-ia'}`}>
                {m.texto}
              </div>
            ))}
            {pensando && (
              <div className="burbuja burbuja-ia escribiendo"><span /><span /><span /></div>
            )}
            <div ref={finRef} />
          </div>

          <div className="fran-pie">
            {disponible && mensajes.length <= 1 && (
              <div className="d-flex gap-2 mb-2" style={{ overflowX: 'auto' }}>
                {SUGERENCIAS.map((s) => (
                  <button key={s} className="fran-sugerencia" onClick={() => enviar(s)}>{s}</button>
                ))}
              </div>
            )}
            <div className="d-flex gap-2">
              <input
                className="control"
                placeholder={disponible ? 'Escribe tu mensaje…' : 'IA no configurada'}
                value={texto}
                disabled={!disponible}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && enviar()}
              />
              <button className="btn-marca" onClick={() => enviar()} disabled={!disponible || pensando} aria-label="Enviar">
                <i className="bi bi-send" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
