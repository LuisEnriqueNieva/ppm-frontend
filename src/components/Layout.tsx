import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { nombreDeTenant } from '../lib/tenants'
import { Icono } from './Iconos'

const PAGINAS = [
  { to: '/', titulo: 'Dashboard', emoji: '📊' },
  { to: '/proyectos', titulo: 'Proyectos', emoji: '🗂️' },
  { to: '/tareas', titulo: 'Tareas', emoji: '📋' },
  { to: '/portafolios', titulo: 'Portafolios', emoji: '📁' },
  { to: '/recursos', titulo: 'Recursos', emoji: '👥' },
  { to: '/presupuestos', titulo: 'Presupuestos', emoji: '💰' },
  { to: '/priorizacion', titulo: 'Priorización', emoji: '🎯' },
  { to: '/usuarios', titulo: 'Usuarios', emoji: '👤' },
]

const enlace = ({ isActive }: { isActive: boolean }) =>
  `flex h-[30px] items-center gap-2 rounded-md px-2 text-sm transition ${
    isActive ? 'bg-hover font-medium text-texto' : 'text-suave hover:bg-hover hover:text-texto'
  }`

export default function Layout() {
  const { sesion, salir } = useAuth()
  const { pathname } = useLocation()
  const [abierto, setAbierto] = useState(false)

  // En móvil, la barra lateral se cierra al navegar
  useEffect(() => setAbierto(false), [pathname])

  if (!sesion) return null
  const tenant = nombreDeTenant(sesion.tenant_id)
  const actual = PAGINAS.find((p) => (p.to === '/' ? pathname === '/' : pathname.startsWith(p.to))) ?? PAGINAS[0]

  return (
    <div className="flex min-h-screen bg-white text-texto">
      {abierto ? (
        <div className="fixed inset-0 z-30 bg-[rgba(15,15,15,0.25)] md:hidden" onClick={() => setAbierto(false)} />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 shrink-0 flex-col border-r border-linea bg-lateral transition-transform duration-200 md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          abierto ? 'translate-x-0 shadow-xl' : '-translate-x-full'
        }`}
      >
        {/* Selector de espacio de trabajo */}
        <div className="p-2">
          <div className="flex h-10 items-center gap-2 rounded-md px-2 transition hover:bg-hover">
            <span className="flex h-6 w-6 items-center justify-center rounded-[5px] bg-acento text-xs font-semibold text-white">
              {tenant.slice(0, 1).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium">Espacio de {tenant}</span>
            <Icono n="abajo" className="h-3.5 w-3.5 text-tenue" />
          </div>
        </div>

        <p className="mb-1 mt-4 px-4 text-xs font-medium text-tenue">Espacio de trabajo</p>
        <nav className="flex flex-col gap-px px-2">
          {PAGINAS.filter((p) => p.to !== '/usuarios' || sesion.rol === 'ADMIN').map((p) => (
            <NavLink key={p.to} to={p.to} end={p.to === '/'} className={enlace}>
              <span className="w-[18px] text-center text-[15px] leading-none">{p.emoji}</span> {p.titulo}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-linea p-2">
          <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bloque text-xs font-medium text-suave">
              {sesion.usuario_id.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium leading-tight">{sesion.usuario_id}</p>
              <p className="truncate text-xs capitalize text-tenue">{sesion.rol.toLowerCase()}</p>
            </div>
          </div>
          <button onClick={salir} className="mt-0.5 flex h-[30px] w-full items-center gap-2 rounded-md px-2 text-sm text-suave transition hover:bg-hover hover:text-texto">
            <Icono n="salir" className="h-[18px] w-[18px]" /> Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Barra superior con migas de pan */}
        <header className="sticky top-0 z-20 flex h-11 items-center gap-1 bg-white/90 px-3 backdrop-blur">
          <button
            onClick={() => setAbierto(true)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-suave hover:bg-hover md:hidden"
            aria-label="Abrir menú"
          >
            <Icono n="menu" />
          </button>
          <nav className="flex min-w-0 items-center gap-1 text-sm">
            <span className="truncate px-1.5 text-suave">{tenant}</span>
            <span className="text-tenue">/</span>
            <span className="flex items-center gap-1.5 truncate rounded-md px-1.5 py-0.5">
              <span className="leading-none">{actual.emoji}</span> {actual.titulo}
            </span>
          </nav>
        </header>

        <main className="flex-1 px-4 pb-24 sm:px-10 lg:px-24">
          <div key={pathname} className="anim-aparecer mx-auto max-w-[1100px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
