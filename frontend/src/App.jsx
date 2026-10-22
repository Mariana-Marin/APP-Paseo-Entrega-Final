import { Routes, Route, Navigate } from 'react-router-dom'

import NavBar from './componentes/NavBar.jsx'
import PiePagina from './componentes/PiePagina.jsx'
import AsistenteFran from './componentes/AsistenteFran.jsx'
import { useSesion } from './contexto/SesionContexto.jsx'

import Inicio from './paginas/Inicio.jsx'
import Espacios from './paginas/Espacios.jsx'
import Reservas from './paginas/Reservas.jsx'
import Usuarios from './paginas/Usuarios.jsx'
import Entrar from './paginas/Entrar.jsx'
import Porteria from './paginas/Porteria.jsx'
import Ingreso from './paginas/Ingreso.jsx'
import Panel from './paginas/Panel.jsx'
import NoEncontrada from './paginas/NoEncontrada.jsx'

/** Protege rutas que requieren sesión (y opcionalmente rol admin). */
function Protegida({ soloAdmin = false, children }) {
  const { autenticado, esAdmin } = useSesion()
  if (!autenticado) return <Navigate to="/entrar" replace />
  if (soloAdmin && !esAdmin) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <NavBar />

      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/espacios" element={<Espacios />} />
          <Route path="/reservas" element={<Reservas />} />
          <Route path="/usuarios" element={<Protegida soloAdmin><Usuarios /></Protegida>} />
          <Route path="/entrar" element={<Entrar />} />
          <Route path="/porteria" element={<Porteria />} />
          <Route path="/ingreso" element={<Ingreso />} />
          <Route path="/panel" element={<Protegida soloAdmin><Panel /></Protegida>} />
          <Route path="/404" element={<NoEncontrada />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </main>

      <PiePagina />

      <AsistenteFran />
    </div>
  )
}
