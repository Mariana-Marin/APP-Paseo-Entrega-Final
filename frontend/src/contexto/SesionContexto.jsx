import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const SesionContexto = createContext(null)
const CLAVE = 'paseo-sesion'

/**
 * Sesión ligera en el navegador. Guarda el usuario autenticado (sin contraseña)
 * para personalizar formularios de reserva y el panel. No pretende ser seguridad
 * fuerte: es el típico "quién está usando la app" de una app académica.
 */
export function ProveedorSesion({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try {
      const raw = localStorage.getItem(CLAVE)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (usuario) localStorage.setItem(CLAVE, JSON.stringify(usuario))
    else localStorage.removeItem(CLAVE)
  }, [usuario])

  const valor = useMemo(
    () => ({
      usuario,
      autenticado: Boolean(usuario),
      esAdmin: usuario?.rol === 'ADMINISTRADOR',
      iniciar: setUsuario,
      cerrar: () => setUsuario(null),
    }),
    [usuario],
  )

  return <SesionContexto.Provider value={valor}>{children}</SesionContexto.Provider>
}

export function useSesion() {
  const ctx = useContext(SesionContexto)
  if (!ctx) throw new Error('useSesion debe usarse dentro de ProveedorSesion')
  return ctx
}
