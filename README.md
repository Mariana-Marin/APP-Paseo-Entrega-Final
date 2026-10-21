# Paseo de San Francisco · Reservas de zonas comunes

Aplicación completa para reservar las zonas comunes de la unidad residencial
**Paseo de San Francisco** (Sabaneta, Antioquia): piscina, salón social,
gimnasio, zona BBQ, cancha y coworking.

- **Backend:** Java 17 + Spring Boot 4 + Cloud Firestore (Firebase Admin SDK).
- **Frontend:** React 19 + Vite + React Router + React Query + Bootstrap 5.
- **IA:** Gemini mediante **Firebase AI Logic** (asistente "Fran", reserva en
  lenguaje natural y generación de descripciones).
- **Despliegue:** GitHub Pages (frontend) + cualquier host de contenedores/Java
  para el backend.

```
.
├── backend/     API REST (Spring Boot, Gradle)
├── frontend/    Interfaz (React + Vite)
├── firestore.rules · firestore.indexes.json · firebase.json
├── scripts/configurar-firebase.mjs   asistente para crear frontend/.env
└── .github/workflows/desplegar.yml   publica el front en GitHub Pages
```

---

## 1. Requisitos

- **Node.js 20+** y npm.
- **JDK 17 o superior** (probado con JDK 24). Gradle se descarga solo con el wrapper.
- (Opcional) **Firebase CLI** para desplegar reglas y usar el emulador.

---

## 2. Arrancar en local (rápido, sin Firebase)

El backend puede funcionar **en memoria**, ideal para probar sin configurar nada.

**Terminal 1 — Backend**
```bash
cd backend
# Windows (PowerShell):
$env:PASEO_ALMACENAMIENTO="memoria"; .\gradlew.bat bootRun
# macOS/Linux:
PASEO_ALMACENAMIENTO=memoria ./gradlew bootRun
```
Arranca en `http://localhost:8080`. Crea 6 espacios de ejemplo y un usuario
administrador: **admin@paseosanfrancisco.co / paseo2026**.
Documentación interactiva: `http://localhost:8080/swagger-ui.html`.

**Terminal 2 — Frontend**
```bash
cd frontend
npm install
npm run dev
```
Abre `http://localhost:5173`. El front ya apunta a `http://localhost:8080/api`.

> En modo memoria los datos se pierden al reiniciar el backend. Para que queden
> guardados de verdad, configura Firestore (siguiente sección).

---

## 3. Conectar Firebase (Firestore + IA Gemini)

### 3.1 Credenciales del backend (para guardar en Firestore)

1. En la [consola de Firebase](https://console.firebase.google.com/) abre el
   proyecto **app-paseo---entrega-final**.
2. Ve a **Configuración del proyecto → Cuentas de servicio → Generar nueva clave
   privada**. Se descarga un JSON.
3. Guárdalo en `backend/credenciales/firebase-service-account.json`
   (esa carpeta está ignorada por git, no se sube).
4. Arranca el backend así (ya no necesitas `PASEO_ALMACENAMIENTO`):
   ```bash
   cd backend
   ./gradlew bootRun          # macOS/Linux
   .\gradlew.bat bootRun      # Windows
   ```
   En el arranque verás `Conectado a Cloud Firestore`. Ahora los registros se
   guardan en las colecciones `usuarios`, `espacios` y `reservas`.

   > Para la nube, en vez del archivo puedes poner el JSON codificado en Base64
   > en la variable `FIREBASE_CREDENCIALES_BASE64`.

### 3.2 Configuración del frontend (respaldo de lectura + IA)

1. En la consola de Firebase: **Configuración del proyecto → Tus apps → SDK setup
   and configuration → Config**. Copia el objeto `firebaseConfig`.
2. Ejecútalo con el asistente (pega el bloque y pulsa Enter en una línea vacía):
   ```bash
   node scripts/configurar-firebase.mjs
   ```
   Esto crea `frontend/.env`. (También puedes copiar `frontend/.env.example` a
   `frontend/.env` y rellenarlo a mano.)
3. Activa la IA: en la consola, **AI Logic → Comenzar**, elige el proveedor
   **Gemini Developer API** (gratis para empezar). Esto habilita el modelo
   `gemini-3.8-flash` que usa el asistente Fran.
4. Reinicia `npm run dev`. Verás el botón de **Fran** activo y la reserva por
   lenguaje natural.

> **Tokens de Gemini:** no necesitas pegar ninguna API key de Gemini en el
> código. Firebase AI Logic gestiona el acceso al modelo desde tu proyecto de
> Firebase; basta con habilitar "AI Logic" y tener la `firebaseConfig` en el
> `.env`. Si Firebase pide configurar **App Check** para desarrollo local, copia
> el token de depuración que aparece en la consola del navegador y regístralo en
> Firebase → App Check → Apps → *Manage debug tokens* (o ponlo en
> `VITE_APPCHECK_DEBUG_TOKEN`).

---

## 4. Desplegar

### Frontend en GitHub Pages
1. Sube el repositorio a GitHub.
2. En **Settings → Pages**, elige *Build and deployment → GitHub Actions*.
3. (Opcional) En **Settings → Secrets and variables → Actions**:
   - Variable `VITE_API_URL` con la URL pública del backend.
   - Secrets `VITE_FIREBASE_*` con tu configuración de Firebase.
4. Cada push a `main` ejecuta `.github/workflows/desplegar.yml` y publica el sitio
   en `https://<usuario>.github.io/<repo>/`.

### Backend
El backend es un JAR estándar de Spring Boot:
```bash
cd backend
./gradlew bootJar     # genera build/libs/PaseoAPI-1.0.0.jar
java -jar build/libs/PaseoAPI-1.0.0.jar
```
Despliégalo en Render, Railway, Cloud Run, etc. Define las variables:
`FIREBASE_CREDENCIALES_BASE64`, `PASEO_ALMACENAMIENTO=firestore` y
`PASEO_CORS_ORIGENES` con la URL de tu GitHub Pages.

### Reglas de Firestore (opcional)
```bash
firebase deploy --only firestore:rules,firestore:indexes
```

---

## 5. Endpoints principales (API)

| Módulo    | Método | Ruta                                   | Descripción                     |
|-----------|--------|----------------------------------------|---------------------------------|
| Usuarios  | GET    | `/api/usuarios`                        | Listar                          |
|           | POST   | `/api/usuarios`                        | Registrar (contraseña cifrada)  |
|           | POST   | `/api/usuarios/login`                  | Iniciar sesión                  |
| Espacios  | GET    | `/api/espacios`                        | Listar                          |
|           | POST   | `/api/espacios`                        | Registrar                       |
|           | GET    | `/api/espacios/{id}/disponibilidad`    | Horas libres/ocupadas de un día |
| Reservas  | GET    | `/api/reservas`                        | Listar (filtros espacio/usuario)|
|           | POST   | `/api/reservas`                        | Registrar (genera pase/QR)      |
|           | PATCH  | `/api/reservas/{id}/estado`            | Confirmar / cancelar            |
|           | GET    | `/api/reservas/verificar/{codigo}`     | Portería: validar pase          |

Reglas de negocio aplicadas: correo único, contraseña BCrypt que nunca se
devuelve, aforo máximo, horario del espacio, fecha futura y sin choques de
horario entre reservas del mismo espacio.

---

## 6. Cómo probar que todo funciona

1. **Backend:** `cd backend && ./gradlew test` (pruebas de reglas de negocio).
2. **Frontend:** `cd frontend && npm run build` (compila sin errores).
3. **De punta a punta:** con ambos servidores arriba, abre el front, registra un
   residente y un espacio, crea una reserva y verifica que:
   - aparece al instante en el listado (integración real con la API),
   - obtienes un **código de acceso** y su **QR**,
   - en **Portería** el código valida la reserva,
   - una segunda reserva que se solape devuelve un error claro.
