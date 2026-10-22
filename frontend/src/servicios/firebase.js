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

// Token de depuración de App Check. Debe definirse ANTES de inicializar
// App Check. Si se pone el valor 'true', el SDK genera un token y lo imprime en
// la consola del navegador (hay que registrarlo una vez en la consola de
// Firebase). También se puede pegar un token ya registrado.
if (typeof self !== 'undefined') {
  const debugToken = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN
  if (debugToken) {
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken === 'true' ? true : debugToken
  } else if (import.meta.env.DEV) {
    // En desarrollo local activamos el modo debug por defecto para no chocar
    // con App Check mientras se prueba la IA.
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true
  }
}

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

/**
 * Inicializa Firebase App Check. Es obligatorio para Firebase AI Logic (Gemini).
 *  - Con VITE_RECAPTCHA_SITE_KEY usa reCAPTCHA v3 (producción, p. ej. GitHub Pages).
 *  - Sin ella, en local, usa el proveedor de depuración (token en consola).
 * Devuelve una promesa que se resuelve cuando App Check queda listo (o null).
 */
let appCheckPromesa = null
export function asegurarAppCheck() {
  if (!app) return Promise.resolve(null)
  if (appCheckPromesa) return appCheckPromesa

  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
  const usarDebug = Boolean(self?.FIREBASE_APPCHECK_DEBUG_TOKEN)

  // Sin reCAPTCHA y sin modo debug no hay forma de pasar App Check: lo omitimos.
  if (!siteKey && !usarDebug) return Promise.resolve(null)

  appCheckPromesa = import('firebase/app-check')
    .then(({ initializeAppCheck, ReCaptchaV3Provider, CustomProvider }) => {
      // En modo debug el SDK ignora el provider y usa el debug token; aun así
      // debe recibir un ReCaptchaV3Provider válido en forma. Con site key real
      // se usa para producción.
      const provider = new ReCaptchaV3Provider(siteKey || '6LeIxAcTAAAAAGG-placeholder-key')
      void CustomProvider
      const ac = initializeAppCheck(app, { provider, isTokenAutoRefreshEnabled: true })
      self.__APPCHECK__ = ac
      return ac
    })
    .catch((e) => {
      console.warn('No se pudo inicializar App Check:', e)
      return null
    })
  return appCheckPromesa
}
