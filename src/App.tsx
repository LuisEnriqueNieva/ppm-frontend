import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
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
import { idDeSlug, leerUltimoTenant, rutaLogin } from './lib/tenants'

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: false } },
})

function Privado() {
  const { sesion } = useAuth()
  if (sesion) return <Layout />
  const ultimo = leerUltimoTenant()
  return <Navigate to={ultimo ? rutaLogin(ultimo) : '/inicio'} replace />
}

function EntradaTenant() {
  const { tenant } = useParams()
  const id = idDeSlug(tenant)
  return <Navigate to={id ? rutaLogin(id) : '/inicio'} replace />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/inicio" element={<Landing />} />
            <Route path="/:tenant/login" element={<Login />} />
            <Route path="/login" element={<Navigate to="/inicio" replace />} />
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
            <Route path="/:tenant" element={<EntradaTenant />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
