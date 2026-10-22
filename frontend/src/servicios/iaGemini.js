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

const MODELO = import.meta.env.VITE_GEMINI_MODEL ?? 'gemini-3.8-flash'

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
Hablas español, eres cálido, breve y resolutivo. Usa las herramientas disponibles para dar datos reales (no inventes espacios ni horarios).
Cuando el residente quiera reservar, reúne espacio, fecha, hora, duración y número de personas; luego usa la herramienta de borrador de reserva.
Nunca inventes códigos de acceso ni confirmes reservas: eso lo hace el sistema cuando el residente pulsa confirmar.`

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
          description: 'Consulta las horas libres y ocupadas de un espacio en una fecha concreta.',
          parameters: Schema.object({
            properties: {
              espacioId: Schema.string({ description: 'Id del espacio' }),
              fecha: Schema.string({ description: 'Fecha en formato YYYY-MM-DD' }),
            },
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
  })

  const chat = model.startChat()

  // Envía un mensaje y resuelve las llamadas a función hasta obtener texto final.
  async function enviar(mensaje) {
    let resultado = await chat.sendMessage(mensaje)
    // Puede encadenar varias herramientas.
    for (let vuelta = 0; vuelta < 5; vuelta++) {
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
      resultado = await chat.sendMessage(respuestas)
    }
    return resultado.response.text()
  }

  return { enviar }
}

/** Genera una descripción atractiva para un espacio a partir de su nombre/categoría. */
export async function generarDescripcionEspacio({ nombre, categoria, aforo }) {
  const info = await obtenerSdk()
  if (!info) return null
  const { sdk, ai } = info
  const model = sdk.getGenerativeModel(ai, { model: MODELO })
  const prompt = `Escribe una descripción breve (máximo 2 frases, en español, tono cálido y residencial)
para la zona común "${nombre}" (categoría: ${categoria || 'general'}, aforo: ${aforo || 'n/d'} personas)
de la unidad Paseo de San Francisco. No uses comillas ni emojis.`
  const r = await model.generateContent(prompt)
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
    generationConfig: { responseMimeType: 'application/json', responseSchema: esquema },
  })

  const hoy = new Date().toISOString().slice(0, 10)
  const prompt = `Hoy es ${hoy}. Catálogo de espacios: ${catalogo}.
Interpreta esta solicitud de reserva y devuelve el JSON pedido: "${frase}".
Si no se menciona duración usa 2 horas; si no se mencionan personas usa 1.`
  const r = await model.generateContent(prompt)
  try {
    return JSON.parse(r.response.text())
  } catch {
    return null
  }
}
