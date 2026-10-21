// ---------------------------------------------------------------------------
// Inicialización de Firebase para el frontend.
// Se usa para DOS cosas:
//   1) Lectura directa de Firestore como respaldo si el backend no responde
//      (por ejemplo, en GitHub Pages sin servidor encendido).
//   2) El asistente de IA (Gemini) vía Firebase AI Logic.
//
// Toda la configuración viene de variables de entorno VITE_FIREBASE_* para no
// exponer llaves en el repositorio. Si faltan, la app sigue funcionando solo
// con el backend y el asistente se muestra deshabilitado con un aviso claro.
// ---------------------------------------------------------------------------
import { initializeApp } from 'firebase/app'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

/** ¿Tenemos lo mínimo para hablar con Firebase? (apiKey + projectId) */
export const firebaseConfigurado = Boolean(config.apiKey && config.projectId)

let app = null
if (firebaseConfigurado) {
  try {
    app = initializeApp(config)
  } catch (error) {
    console.warn('No se pudo inicializar Firebase:', error)
    app = null
  }
}

export const firebaseApp = app
export const firebaseProjectId = config.projectId ?? null
