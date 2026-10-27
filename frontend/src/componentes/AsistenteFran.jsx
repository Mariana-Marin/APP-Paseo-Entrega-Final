import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { iaDisponible, crearChatConHerramientas, mensajeSobrecarga } from '../servicios/iaGemini.js'
import { listarEspacios, obtenerDisponibilidad } from '../servicios/servicioEspacios.js'
import { obtenerResumenDia } from '../servicios/servicioReservas.js'
import { responderRapido } from '../servicios/respuestasRapidas.js'

const SUGERENCIAS = [
  '¿Qué está libre hoy?',
  '¿Qué espacios hay?',
  'Horarios de las zonas',
  '¿Cómo reservo?',
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
    // Estado de TODAS las zonas en un día en UNA sola consulta al backend (rápido).
    resumenDelDia: async ({ fecha } = {}) => {
      const dia = fecha || new Date().toISOString().slice(0, 10)
      const zonas = await obtenerResumenDia(dia)
      return { fecha: dia, zonas }
    },
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
      // 1) Respuestas rápidas con datos directos (sin IA). Funcionan siempre,
      //    al instante, aunque Gemini esté saturado.
      let rapida = null
      try {
        rapida = await responderRapido(pregunta)
      } catch (e) {
        console.warn('Respuesta rápida falló, se intentará con IA:', e)
      }
      if (rapida) {
        setMensajes((m) => [...m, { autor: 'ia', texto: rapida }])
        return
      }

      // 2) Si no hubo coincidencia, usar la IA (si está configurada).
      if (!disponible) {
        setMensajes((m) => [...m, {
          autor: 'sistema',
          texto: 'Puedo responder sobre espacios, disponibilidad de hoy, horarios y cómo reservar. Para consultas más libres se necesita la IA configurada.',
        }])
        return
      }
      const chat = await asegurarChat()
      if (!chat) throw new Error('IA no disponible')
      const respuesta = await chat.enviar(pregunta)
      setMensajes((m) => [...m, { autor: 'ia', texto: respuesta || 'Listo.' }])
    } catch (e) {
      const texto = mensajeSobrecarga(e)
        ?? 'Ups, no pude responder ahora. Intenta con otra pregunta o inténtalo de nuevo en unos segundos.'
      setMensajes((m) => [...m, { autor: 'sistema', texto }])
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
              <small style={{ opacity: .85 }}>{disponible ? 'Conserje con IA · en línea' : 'Conserje · respuestas rápidas'}</small>
            </div>
          </div>

          <div className="fran-cuerpo">
            {!disponible && (
              <div className="burbuja burbuja-sistema">
                Respondo al instante sobre espacios, disponibilidad de hoy, horarios y cómo reservar.
                Para conversaciones más libres, configura la IA (Firebase + Gemini).
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
            {mensajes.length <= 1 && (
              <div className="d-flex gap-2 mb-2" style={{ overflowX: 'auto' }}>
                {SUGERENCIAS.map((s) => (
                  <button key={s} className="fran-sugerencia" onClick={() => enviar(s)}>{s}</button>
                ))}
              </div>
            )}
            <div className="d-flex gap-2">
              <input
                className="control"
                placeholder="Escribe tu mensaje…"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && enviar()}
              />
              <button className="btn-marca" onClick={() => enviar()} disabled={pensando} aria-label="Enviar">
                <i className="bi bi-send" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
