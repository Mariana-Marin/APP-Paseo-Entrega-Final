#!/usr/bin/env node
/**
 * Asistente para crear frontend/.env a partir de la configuración de Firebase.
 *
 * Uso:
 *   node scripts/configurar-firebase.mjs
 *
 * Pega el objeto firebaseConfig que te da la consola de Firebase
 * (Configuración del proyecto > Tus apps > SDK setup and configuration > Config)
 * y el script extrae las llaves y escribe frontend/.env sin que tengas que
 * editar nada a mano. También puedes pasar la URL del backend.
 */
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const destino = path.join(raiz, 'frontend', '.env')

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const preguntar = (q) => new Promise((res) => rl.question(q, res))

function extraer(texto, llave) {
  const m = texto.match(new RegExp(`${llave}\\s*[:=]\\s*["'\`]([^"'\`]+)["'\`]`))
  return m ? m[1] : ''
}

console.log('\n=== Configuración de Firebase para Paseo de San Francisco ===\n')
console.log('Pega el bloque firebaseConfig (termina con una línea vacía):\n')

let buffer = ''
rl.on('line', async (linea) => {
  if (linea.trim() === '' && buffer.trim() !== '') {
    const apiKey = extraer(buffer, 'apiKey')
    const authDomain = extraer(buffer, 'authDomain')
    const projectId = extraer(buffer, 'projectId')
    const storageBucket = extraer(buffer, 'storageBucket')
    const messagingSenderId = extraer(buffer, 'messagingSenderId')
    const appId = extraer(buffer, 'appId')

    if (!apiKey || !projectId) {
      console.error('\n No encontré apiKey o projectId. Revisa el bloque pegado.\n')
      rl.close()
      return
    }

    const apiUrl = (await preguntar('\nURL del backend [http://localhost:8080/api]: ')).trim()
      || 'http://localhost:8080/api'
    const modelo = (await preguntar('Modelo de Gemini [gemini-3.8-flash]: ')).trim()
      || 'gemini-3.8-flash'

    const contenido = [
      `VITE_API_URL=${apiUrl}`,
      `VITE_FIREBASE_API_KEY=${apiKey}`,
      `VITE_FIREBASE_AUTH_DOMAIN=${authDomain}`,
      `VITE_FIREBASE_PROJECT_ID=${projectId}`,
      `VITE_FIREBASE_STORAGE_BUCKET=${storageBucket}`,
      `VITE_FIREBASE_MESSAGING_SENDER_ID=${messagingSenderId}`,
      `VITE_FIREBASE_APP_ID=${appId}`,
      `VITE_GEMINI_MODEL=${modelo}`,
      '',
    ].join('\n')

    fs.writeFileSync(destino, contenido)
    console.log(`\n Listo. Escribí ${destino}\n`)
    console.log('Ahora puedes: cd frontend && npm run dev\n')
    rl.close()
  } else {
    buffer += linea + '\n'
  }
})
