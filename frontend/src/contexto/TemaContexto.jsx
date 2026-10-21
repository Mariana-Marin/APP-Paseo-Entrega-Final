import { createContext, useContext, useEffect, useState } from 'react'

const TemaContexto = createContext(null)
const CLAVE = 'paseo-tema'

export function ProveedorTema({ children }) {
  const [tema, setTema] = useState(() => {
    const guardado = localStorage.getItem(CLAVE)
    if (guardado) return guardado
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-tema', tema)
    document.documentElement.style.colorScheme = tema === 'oscuro' ? 'dark' : 'light'
    localStorage.setItem(CLAVE, tema)
  }, [tema])

  const alternar = () => setTema((t) => (t === 'oscuro' ? 'claro' : 'oscuro'))

  return (
    <TemaContexto.Provider value={{ tema, alternar }}>{children}</TemaContexto.Provider>
  )
}

export function useTema() {
  const ctx = useContext(TemaContexto)
  if (!ctx) throw new Error('useTema debe usarse dentro de ProveedorTema')
  return ctx
}
