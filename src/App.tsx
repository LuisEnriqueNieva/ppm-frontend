import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './lib/auth'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Proyectos from './pages/Proyectos'
import ProyectoDetalle from './pages/ProyectoDetalle'
import Portafolios from './pages/Portafolios'
import Tareas from './pages/Tareas'
import Recursos from './pages/Recursos'
import Presupuestos from './pages/Presupuestos'
import Priorizacion from './pages/Priorizacion'
import Usuarios from './pages/Usuarios'

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: false } },
})

function Privado() {
  const { sesion } = useAuth()
  return sesion ? <Layout /> : <Navigate to="/inicio" replace />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/inicio" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route element={<Privado />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/proyectos" element={<Proyectos />} />
              <Route path="/proyectos/:id" element={<ProyectoDetalle />} />
              <Route path="/tareas" element={<Tareas />} />
              <Route path="/portafolios" element={<Portafolios />} />
              <Route path="/recursos" element={<Recursos />} />
              <Route path="/presupuestos" element={<Presupuestos />} />
              <Route path="/priorizacion" element={<Priorizacion />} />
              <Route path="/usuarios" element={<Usuarios />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
