import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import NavBar from './componentes/NavBar.jsx'
import PiePagina from './componentes/PiePagina.jsx'
import PaletaComandos from './componentes/PaletaComandos.jsx'
import AsistenteFran from './componentes/AsistenteFran.jsx'

import Inicio from './paginas/Inicio.jsx'
import Espacios from './paginas/Espacios.jsx'
import Reservas from './paginas/Reservas.jsx'
import Usuarios from './paginas/Usuarios.jsx'
import Entrar from './paginas/Entrar.jsx'
import Porteria from './paginas/Porteria.jsx'
import Panel from './paginas/Panel.jsx'
import NoEncontrada from './paginas/NoEncontrada.jsx'

export default function App() {
  const [comandosAbierto, setComandosAbierto] = useState(false)

  // Atajo global Ctrl/Cmd + K para la paleta de comandos.
  useEffect(() => {
    const alPulsar = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setComandosAbierto((v) => !v)
      }
    }
    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [])

  return (
    <div className="d-flex flex-column min-vh-100">
      <NavBar onAbrirComandos={() => setComandosAbierto(true)} />

      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/espacios" element={<Espacios />} />
          <Route path="/reservas" element={<Reservas />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/entrar" element={<Entrar />} />
          <Route path="/porteria" element={<Porteria />} />
          <Route path="/panel" element={<Panel />} />
          <Route path="/404" element={<NoEncontrada />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </main>

      <PiePagina />

      <PaletaComandos abierto={comandosAbierto} alCerrar={() => setComandosAbierto(false)} />
      <AsistenteFran />
    </div>
  )
}
