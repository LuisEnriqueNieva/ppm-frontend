import { useState, type CSSProperties, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { TENANTS, colorDeTenant, idDeSlug, nombreDeTenant } from '../lib/tenants'
import { BotonPrimario, Campo, ErrorMsg, entrada } from '../components/ui'
import { Logo } from '../components/Logo'

export default function Login() {
  const { sesion, entrar, salir } = useAuth()
  const navegar = useNavigate()
  const { tenant: slug } = useParams()
  const tenant = idDeSlug(slug)
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<unknown>(null)
  const [cargando, setCargando] = useState(false)

  if (!tenant) return <Navigate to="/inicio" replace />
  if (sesion && sesion.tenant_id === tenant) return <Navigate to="/" replace />

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setCargando(true)
    try {
      await entrar(tenant, usuario.trim(), password)
      navegar('/', { replace: true })
    } catch (err) {
      setError(err)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-texto">
      <header className="flex h-14 items-center justify-between px-5">
        <Link to="/inicio" className="rounded-md p-1 transition hover:bg-hover">
          <Logo />
        </Link>
        <Link to="/inicio" className="rounded-md px-2.5 py-1.5 text-sm text-suave transition hover:bg-hover hover:text-texto">
          Volver al inicio
        </Link>
      </header>

      <main className="flex flex-1 justify-center px-4 pb-16 pt-[8vh]">
        {sesion ? (
          <div className="anim-aparecer w-full max-w-[340px]">
            <h1 className="text-[28px] font-bold leading-tight tracking-[-0.02em]">Sesión abierta</h1>
            <p className="mb-6 mt-1 text-[15px] text-suave">
              Esta pestaña tiene una sesión activa en {nombreDeTenant(sesion.tenant_id)}. Ciérrala para entrar a {nombreDeTenant(tenant)}.
            </p>
            <BotonPrimario type="button" onClick={salir} className="h-10 w-full">
              Cerrar sesión
            </BotonPrimario>
          </div>
        ) : (
        <form
          onSubmit={enviar}
          className="anim-aparecer w-full max-w-[340px]"
          style={{ '--acento': colorDeTenant(tenant) } as CSSProperties}
        >
          <div className="mb-6 flex items-center gap-2.5">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold text-white"
              style={{ background: TENANTS[tenant].color }}
            >
              {TENANTS[tenant].nombre.slice(0, 1)}
            </span>
            <span className="text-[17px] font-semibold">{TENANTS[tenant].nombre}</span>
          </div>
          <h1 className="text-[28px] font-bold leading-tight tracking-[-0.02em]">Inicia sesión</h1>
          <p className="mb-8 mt-1 text-[15px] text-suave">Entra al espacio de trabajo de {TENANTS[tenant].nombre}.</p>

          <Campo etiqueta="Usuario">
            <input
              className={entrada}
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Tu usuario"
              autoComplete="username"
              autoFocus
            />
          </Campo>
          <Campo etiqueta="Contraseña">
            <input
              type="password"
              className={entrada}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </Campo>

          {error ? <div className="mb-4"><ErrorMsg error={error} /></div> : null}

          <BotonPrimario type="submit" disabled={cargando || !usuario || !password} className="mt-2 h-10 w-full">
            {cargando ? 'Ingresando…' : 'Continuar'}
          </BotonPrimario>

          <p className="mt-6 text-center text-xs leading-relaxed text-tenue">
            Tus datos sólo son visibles dentro de tu organización.
          </p>
        </form>
        )}
      </main>
    </div>
  )
}
