import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './estilos/tema.css'
import './estilos/componentes.css'

import App from './App.jsx'
import { ProveedorTema } from './contexto/TemaContexto.jsx'
import { ProveedorSesion } from './contexto/SesionContexto.jsx'

// En GitHub Pages el sitio vive en /<repo>/, así que el router usa ese basename.
const basename = import.meta.env.BASE_URL?.replace(/\/$/, '') || '/'

const clienteQuery = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={clienteQuery}>
      <ProveedorTema>
        <ProveedorSesion>
          <BrowserRouter basename={basename}>
            <App />
          </BrowserRouter>
          <Toaster richColors position="top-center" expand closeButton />
        </ProveedorSesion>
      </ProveedorTema>
    </QueryClientProvider>
  </StrictMode>,
)
