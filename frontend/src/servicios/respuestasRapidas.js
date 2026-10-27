// ---------------------------------------------------------------------------
// Respuestas rápidas SIN IA.
//
// Detecta preguntas frecuentes del conserje (qué espacios hay, qué está libre u
// ocupado hoy, horarios, cómo reservar...) y las responde al instante con datos
// reales de la API, sin pasar por Gemini. Así funcionan siempre, aunque el
// modelo esté saturado. Si ninguna regla coincide, devuelve null y el chat usa
// la IA como respaldo.
// ---------------------------------------------------------------------------
import { listarEspacios } from './servicioEspacios.js'
import { obtenerResumenDia } from './servicioReservas.js'
import { categoria } from '../utilidades/formato.js'

const QUITAR_TILDES = (s) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

function hhmm(h) {
  return `${String(h).padStart(2, '0')}:00`
}

/** Franjas ocupadas (array de "HH:00-HH:00") a texto legible. */
function textoOcupacion(zona) {
  if (!zona.franjasOcupadas || zona.franjasOcupadas.length === 0) return 'libre todo el día'
  return 'ocupada ' + zona.franjasOcupadas.join(', ')
}

/**
 * Intenta responder la pregunta con datos directos. Devuelve un string (la
 * respuesta) o null si no hay una regla que aplique.
 */
export async function responderRapido(preguntaOriginal) {
  const q = QUITAR_TILDES(preguntaOriginal)

  // Palabras clave
  const mencionaHoy = /\bhoy\b/.test(q)
  const mencionaDisponible = /(libre|disponible|desocupad|ocupad|reservad)/.test(q)
  const mencionaEspacios = /(espacio|zona|zonas|comun|instalacion|que hay|cuales hay)/.test(q)
  const mencionaHorario = /(horario|hora|abre|cierra|cierre|apertura|a que hora)/.test(q)
  const mencionaReservar = /(como reserv|reservar|hacer una reserva|quiero reservar)/.test(q)
  const mencionaSaludo = /^(hola|buenas|hey|hi|holi|buenos dias|buenas tardes|buenas noches)\b/.test(q)
  const mencionaAyuda = /(que puedes hacer|ayuda|en que me ayudas|para que sirves|opciones)/.test(q)

  // --- Saludo / ayuda ---
  if (mencionaSaludo && q.length < 25) {
    return '¡Hola! Soy Fran. Puedo decirte qué zonas hay, cuáles están libres u ocupadas hoy, sus horarios, y ayudarte a reservar. ¿Qué necesitas?'
  }
  if (mencionaAyuda) {
    return 'Puedo ayudarte con:\n• Ver las zonas comunes y sus horarios.\n• Saber qué está libre u ocupado hoy.\n• Guiarte para reservar un espacio.\nPregúntame, por ejemplo: "¿qué está libre hoy?".'
  }

  // --- Disponibilidad de hoy (la pregunta clásica que se colgaba) ---
  if (mencionaDisponible || (mencionaHoy && (mencionaEspacios || mencionaDisponible))) {
    const dia = new Date().toISOString().slice(0, 10)
    const zonas = await obtenerResumenDia(dia)
    if (!zonas || zonas.length === 0) return 'Aún no hay zonas comunes registradas.'

    const pideOcupadas = /\bocupad/.test(q)
    const libres = zonas.filter((z) => z.estado === 'libre todo el día')
    const ocupadas = zonas.filter((z) => z.estado !== 'libre todo el día')

    if (pideOcupadas) {
      if (ocupadas.length === 0) return 'Hoy no hay ninguna zona ocupada: todas están libres. 🎉'
      const lineas = ocupadas.map((z) => `• ${z.espacio}: ${textoOcupacion(z)}`)
      return `Hoy están con reservas:\n${lineas.join('\n')}\n\nLas demás están libres. ¿Reservamos alguna?`
    }

    // Por defecto, mostrar las libres
    if (libres.length === zonas.length) {
      return `¡Buenas noticias! Hoy todas las zonas están libres:\n${zonas.map((z) => `• ${z.espacio}`).join('\n')}\n\n¿Quieres reservar una?`
    }
    const lineasLibres = libres.length
      ? libres.map((z) => `• ${z.espacio}`).join('\n')
      : '(ninguna del todo libre)'
    const lineasOcupadas = ocupadas.map((z) => `• ${z.espacio}: ${textoOcupacion(z)}`).join('\n')
    return `Estado de hoy:\n\nLibres todo el día:\n${lineasLibres}\n\nCon reservas:\n${lineasOcupadas}\n\n¿Reservamos alguna?`
  }

  // --- Horarios / listado de espacios ---
  if (mencionaHorario || mencionaEspacios) {
    const { datos } = await listarEspacios()
    if (!datos || datos.length === 0) return 'Aún no hay zonas comunes registradas.'
    const lineas = datos.map((e) => {
      const cat = categoria(e.categoria).etiqueta
      const horario = e.horaApertura != null ? ` · ${hhmm(e.horaApertura)}–${hhmm(e.horaCierre)}` : ''
      const aforo = e.aforo != null ? ` · aforo ${e.aforo}` : ''
      const comp = e.compartible ? ' · compartido' : ''
      return `• ${e.nombre} (${cat})${horario}${aforo}${comp}`
    })
    const intro = mencionaHorario ? 'Estos son los horarios de las zonas comunes:' : 'Estas son las zonas comunes de la unidad:'
    return `${intro}\n${lineas.join('\n')}\n\n¿Te gustaría reservar alguna?`
  }

  // --- Cómo reservar ---
  if (mencionaReservar && !/[0-9]/.test(q)) {
    // Solo la guía general; si hay detalles concretos (números/fechas) deja que la IA lo arme.
    return 'Para reservar: entra con tu cuenta, ve a "Reservas", elige el espacio y la fecha, mira las horas libres y confirma. Recibirás un pase con QR. ¿Quieres que te lleve al formulario? Dime qué espacio.'
  }

  // Sin regla aplicable -> que responda la IA
  return null
}
