// ---------------------------------------------------------------------------
// Integración de IA con Gemini a través de Firebase AI Logic (SDK 'firebase/ai').
//
// Expone:
//   - iaDisponible(): si hay configuración de Firebase para usar el modelo.
//   - crearChatConHerramientas(): chat multivuelta con "function calling" para
//     que el asistente Fran consulte espacios, disponibilidad y cree borradores
//     de reserva usando la propia API del proyecto.
//   - generarDescripcionEspacio(): texto de marketing para un espacio.
//   - interpretarReservaLibre(): convierte una frase en lenguaje natural en los
//     campos estructurados de una reserva (salida JSON con esquema).
//
// El modelo se toma de VITE_GEMINI_MODEL (por defecto gemini-3.8-flash).
// ---------------------------------------------------------------------------
import { firebaseApp, firebaseConfigurado, asegurarAppCheck } from './firebase.js'

// Google solo habilita gemini-3.8-flash para proyectos nuevos (los 2.5 dan 404).
// Ese modelo a veces responde 500 "alta demanda"; se maneja con reintentos
// (ver pedirConReintentos). Configurable con VITE_GEMINI_MODEL.
const MODELO = import.meta.env.VITE_GEMINI_MODEL ?? 'gemini-3.8-flash'

// Los modelos modernos de Gemini pueden traer "thinking" activado por defecto,
// lo que añade latencia. Para un conserje que debe responder rápido, pedimos el
// mínimo presupuesto de pensamiento (0 = desactivado, según el SDK JS).
const CONFIG_RAPIDA = {
  thinkingConfig: { thinkingBudget: 0 },
}

const demora = (ms) => new Promise((r) => setTimeout(r, ms))

/** ¿El error del modelo es temporal (saturación) y conviene reintentar? */
function esSobrecarga(e) {
  const msg = (e?.message || '').toLowerCase()
  return (
    msg.includes('high demand') ||
    msg.includes('overloaded') ||
    msg.includes('503') ||
    msg.includes('500') ||
    msg.includes('unavailable') ||
    msg.includes('try again')
  )
}

/**
 * Ejecuta una llamada al modelo reintentando cuando Google responde "alta
 * demanda" (error 500/503 temporal). Hasta 6 intentos con espera creciente
 * (~1.5 min en total) para sobrevivir picos de saturación del modelo.
 */
async function pedirConReintentos(accion) {
  let ultimoError
  const esperas = [1000, 2500, 5000, 8000, 12000] // ms entre intentos
  for (let intento = 0; intento <= esperas.length; intento++) {
    try {
      return await accion()
    } catch (e) {
      ultimoError = e
      if (!esSobrecarga(e) || intento === esperas.length) throw e
      await demora(esperas[intento])
    }
  }
  throw ultimoError
}

/** Mensaje amable cuando el modelo de Google está saturado. */
export function mensajeSobrecarga(e) {
  if (esSobrecarga(e)) {
    return 'El asistente está con mucha demanda en este momento (del lado de Google). Vuelve a intentarlo en unos segundos.'
  }
  return null
}

let aiPromesa = null

export function iaDisponible() {
  return firebaseConfigurado && Boolean(firebaseApp)
}

async function obtenerSdk() {
  if (!iaDisponible()) return null
  if (!aiPromesa) {
    aiPromesa = (async () => {
      // App Check es obligatorio para AI Logic; lo preparamos antes de llamar.
      await asegurarAppCheck()
      const sdk = await import('firebase/ai')
      const ai = sdk.getAI(firebaseApp, { backend: new sdk.GoogleAIBackend() })
      return { sdk, ai }
    })().catch((e) => {
      console.warn('No se pudo inicializar Firebase AI Logic:', e)
      return null
    })
  }
  return aiPromesa
}

const INSTRUCCION_FRAN = `Eres "Fran", el conserje virtual de la unidad residencial Paseo de San Francisco (Sabaneta, Antioquia).
Ayudas a los residentes a conocer y reservar las zonas comunes (piscina, salón social, gimnasio, zona BBQ, cancha, coworking).
Hablas español, eres cálido, breve y resolutivo.
Reglas de uso de herramientas (importante para ser rápido):
- Si preguntan qué zonas están ocupadas o libres hoy o en un día, usa SIEMPRE "resumenDelDia" (una sola llamada). NO llames a "consultarDisponibilidad" espacio por espacio.
- Usa "consultarDisponibilidad" solo cuando preguntan por UN espacio específico.
- Usa "listarEspacios" solo si necesitas la lista o detalles de los espacios.
- Cuando el residente quiera reservar, reúne espacio, fecha, hora, duración y personas; luego usa "prepararReserva".
- Si una pregunta no necesita datos del sistema, responde directamente sin llamar herramientas.
No inventes espacios, horarios ni códigos; las confirmaciones las hace el sistema cuando el residente pulsa confirmar.`

/**
 * Crea un chat de Gemini con herramientas (function calling). Las funciones
 * reales las ejecuta quien llama, a través del mapa 'ejecutores'.
 */
export async function crearChatConHerramientas(ejecutores) {
  const info = await obtenerSdk()
  if (!info) return null
  const { sdk, ai } = info
  const { getGenerativeModel, Schema } = sdk

  const herramientas = [
    {
      functionDeclarations: [
        {
          name: 'listarEspacios',
          description: 'Devuelve las zonas comunes disponibles con su aforo, categoría y horario.',
        },
        {
          name: 'consultarDisponibilidad',
          description: 'Consulta las horas libres y ocupadas de UN espacio en una fecha concreta.',
          parameters: Schema.object({
            properties: {
              espacioId: Schema.string({ description: 'Id del espacio' }),
              fecha: Schema.string({ description: 'Fecha en formato YYYY-MM-DD' }),
            },
          }),
        },
        {
          name: 'resumenDelDia',
          description: 'Devuelve en UNA sola llamada el estado (libre/ocupado y horas) de TODAS las zonas comunes en una fecha. Úsala cuando pregunten qué espacios están ocupados o libres hoy o en un día.',
          parameters: Schema.object({
            properties: {
              fecha: Schema.string({ description: 'Fecha en formato YYYY-MM-DD (si no la dan, usa hoy)' }),
            },
            optionalProperties: ['fecha'],
          }),
        },
        {
          name: 'prepararReserva',
          description: 'Prepara un borrador de reserva para que el residente la confirme en pantalla.',
          parameters: Schema.object({
            properties: {
              espacioId: Schema.string({ description: 'Id del espacio a reservar' }),
              fecha: Schema.string({ description: 'Fecha y hora inicio en formato YYYY-MM-DDTHH:mm' }),
              tiempo: Schema.number({ description: 'Duración en horas' }),
              personas: Schema.number({ description: 'Número de asistentes' }),
            },
          }),
        },
      ],
    },
  ]

  const model = getGenerativeModel(ai, {
    model: MODELO,
    systemInstruction: INSTRUCCION_FRAN,
    tools: herramientas,
    generationConfig: { ...CONFIG_RAPIDA },
  })

  const chat = model.startChat()

  const textoSeguro = (resp) => {
    try { return resp.text() } catch { return '' }
  }

  // Envía un mensaje (con reintentos si el modelo está saturado) y resuelve las
  // llamadas a función hasta obtener texto final. Limita a 3 rondas de herramientas.
  async function enviar(mensaje) {
    let resultado = await pedirConReintentos(() => chat.sendMessage(mensaje))
    for (let vuelta = 0; vuelta < 3; vuelta++) {
      const llamadas = resultado.response.functionCalls?.() ?? []
      if (!llamadas.length) break
      const respuestas = []
      for (const llamada of llamadas) {
        const ejecutor = ejecutores[llamada.name]
        let salida
        try {
          salida = ejecutor ? await ejecutor(llamada.args ?? {}) : { error: 'herramienta desconocida' }
        } catch (e) {
          salida = { error: e?.message ?? 'fallo al ejecutar la herramienta' }
        }
        respuestas.push({ functionResponse: { name: llamada.name, response: { resultado: salida } } })
      }
      resultado = await pedirConReintentos(() => chat.sendMessage(respuestas))
    }

    let texto = textoSeguro(resultado.response)
    // Si tras las herramientas el modelo no entregó texto, pídele que responda en palabras.
    if (!texto && (resultado.response.functionCalls?.()?.length ?? 0) > 0) {
      try {
        const cierre = await pedirConReintentos(() => chat.sendMessage(
          'Responde ahora al residente en español, de forma breve y clara, con la información que ya obtuviste. No llames más herramientas.',
        ))
        texto = textoSeguro(cierre.response)
      } catch { /* ignore */ }
    }
    return texto || 'No pude completar la consulta en este momento. ¿Puedes reformular tu pregunta?'
  }

  return { enviar }
}

/** Genera una descripción atractiva para un espacio a partir de su nombre/categoría. */
export async function generarDescripcionEspacio({ nombre, categoria, aforo }) {
  const info = await obtenerSdk()
  if (!info) return null
  const { sdk, ai } = info
  const model = sdk.getGenerativeModel(ai, { model: MODELO, generationConfig: { ...CONFIG_RAPIDA } })
  const prompt = `Escribe una descripción breve (máximo 2 frases, en español, tono cálido y residencial)
para la zona común "${nombre}" (categoría: ${categoria || 'general'}, aforo: ${aforo || 'n/d'} personas)
de la unidad Paseo de San Francisco. No uses comillas ni emojis.`
  const r = await pedirConReintentos(() => model.generateContent(prompt))
  return r.response.text().trim()
}

/**
 * Interpreta una frase libre ("quiero el salón el sábado a las 3 por 2 horas para 10")
 * y devuelve un objeto estructurado. 'espacios' ayuda al modelo a elegir el id.
 */
export async function interpretarReservaLibre(frase, espacios) {
  const info = await obtenerSdk()
  if (!info) return null
  const { sdk, ai } = info
  const { getGenerativeModel, Schema } = sdk

  const catalogo = espacios.map((e) => `${e.id} = ${e.nombre} (${e.categoria})`).join('; ')
  const esquema = Schema.object({
    properties: {
      espacioId: Schema.string({ description: 'Id del espacio elegido del catálogo' }),
      fecha: Schema.string({ description: 'Fecha y hora inicio YYYY-MM-DDTHH:mm' }),
      tiempo: Schema.number({ description: 'Duración en horas' }),
      personas: Schema.number({ description: 'Número de personas' }),
      confianza: Schema.number({ description: 'Confianza 0-1 de la interpretación' }),
    },
    optionalProperties: ['confianza'],
  })

  const model = getGenerativeModel(ai, {
    model: MODELO,
    generationConfig: { responseMimeType: 'application/json', responseSchema: esquema, ...CONFIG_RAPIDA },
  })

  const hoy = new Date().toISOString().slice(0, 10)
  const prompt = `Hoy es ${hoy}. Catálogo de espacios: ${catalogo}.
Interpreta esta solicitud de reserva y devuelve el JSON pedido: "${frase}".
Si no se menciona duración usa 2 horas; si no se mencionan personas usa 1.`
  const r = await pedirConReintentos(() => model.generateContent(prompt))
  try {
    return JSON.parse(r.response.text())
  } catch {
    return null
  }
}
