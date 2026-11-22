import { createContext, useContext, useState, type ReactNode } from 'react'
import { borrarSesion, guardarSesion, leerSesion, post, type Sesion } from './api'
import { colorDeTenant, guardarUltimoTenant } from './tenants'

interface Ctx {
  sesion: Sesion | null
  entrar: (tenant_id: string, usuario_id: string, password: string) => Promise<void>
  salir: () => void
}
const AuthContext = createContext<Ctx>(null!)
export const useAuth = () => useContext(AuthContext)

const pintar = (tenant: string | null) =>
  document.documentElement.style.setProperty('--acento', colorDeTenant(tenant ?? ''))

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(() => {
    const s = leerSesion()
    pintar(s?.tenant_id ?? null)
    return s
  })

  const entrar = async (tenant_id: string, usuario_id: string, password: string) => {
    const r = await post<Sesion>('auth', '/auth/login', { tenant_id, usuario_id, password })
    const s: Sesion = {
      token: r.token,
      tenant_id: r.tenant_id,
      usuario_id: r.usuario_id,
      rol: r.rol,
    }
    guardarSesion(s)
    guardarUltimoTenant(s.tenant_id)
    pintar(s.tenant_id)
    setSesion(s)
  }
  const salir = () => {
    borrarSesion()
    pintar(null)
    setSesion(null)
  }
  return <AuthContext.Provider value={{ sesion, entrar, salir }}>{children}</AuthContext.Provider>
}
