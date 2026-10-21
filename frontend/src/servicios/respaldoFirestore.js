// ---------------------------------------------------------------------------
// Respaldo de SOLO LECTURA directo a Cloud Firestore.
// Se usa cuando el backend Spring Boot no está disponible (típico en GitHub
// Pages, donde no hay servidor). Así los listados nunca quedan vacíos si la
// base tiene datos. Las escrituras siguen yendo siempre por el backend.
// ---------------------------------------------------------------------------
import { firebaseApp, firebaseConfigurado } from './firebase.js'

let dbPromesa = null

async function obtenerDb() {
  if (!firebaseConfigurado || !firebaseApp) return null
  if (!dbPromesa) {
    dbPromesa = import('firebase/firestore')
      .then(({ getFirestore }) => getFirestore(firebaseApp))
      .catch((e) => {
        console.warn('No se pudo cargar Firestore:', e)
        return null
      })
  }
  return dbPromesa
}

async function leerColeccion(nombre) {
  const db = await obtenerDb()
  if (!db) return null
  const { collection, getDocs } = await import('firebase/firestore')
  const snap = await getDocs(collection(db, nombre))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const respaldoDisponible = firebaseConfigurado

export async function leerEspaciosRespaldo() {
  return leerColeccion('espacios')
}

export async function leerUsuariosRespaldo() {
  const datos = await leerColeccion('usuarios')
  if (!datos) return null
  // Nunca exponemos el hash de la contraseña, igual que hace el backend.
  return datos.map(({ contrasena: _omitida, ...resto }) => resto)
}

export async function leerReservasRespaldo() {
  return leerColeccion('reservas')
}
