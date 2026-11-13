import { useState, type CSSProperties, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { TENANTS, colorDeTenant } from '../lib/tenants'
import { BotonPrimario, Campo, ErrorMsg, entrada } from '../components/ui'
import { Icono } from '../components/Iconos'
import { Logo } from '../components/Logo'

export default function Login() {
  const { sesion, entrar } = useAuth()
  const navegar = useNavigate()
  const [tenant, setTenant] = useState('ACM')
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<unknown>(null)
  const [cargando, setCargando] = useState(false)

  if (sesion) return <Navigate to="/" replace />

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
        {/* El acento del formulario adopta el color de la organización elegida */}
        <form
          onSubmit={enviar}
          className="anim-aparecer w-full max-w-[340px]"
          style={{ '--acento': colorDeTenant(tenant) } as CSSProperties}
        >
          <h1 className="text-[28px] font-bold leading-tight tracking-[-0.02em]">Inicia sesión</h1>
          <p className="mb-8 mt-1 text-[15px] text-suave">Entra al espacio de trabajo de tu organización.</p>

          <fieldset className="mb-4">
            <legend className="mb-1.5 text-xs font-medium text-suave">Organización</legend>
            <div className="space-y-1">
              {Object.entries(TENANTS).map(([id, t]) => {
                const activo = id === tenant
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTenant(id)}
                    aria-pressed={activo}
                    className={`flex h-10 w-full items-center gap-2.5 rounded-md border px-2.5 text-left text-sm transition ${
                      activo ? 'border-acento/50 bg-acento/5' : 'border-linea hover:bg-hover'
                    }`}
                  >
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-[5px] text-xs font-semibold text-white"
                      style={{ background: t.color }}
                    >
                      {t.nombre.slice(0, 1)}
                    </span>
                    <span className="flex-1 font-medium">{t.nombre}</span>
                    {activo ? <Icono n="check" className="h-4 w-4 text-acento" /> : null}
                  </button>
                )
              })}
            </div>
          </fieldset>

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
      </main>
    </div>
  )
}
