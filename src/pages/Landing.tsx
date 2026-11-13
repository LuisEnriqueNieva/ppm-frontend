import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { Icono } from '../components/Iconos'
import { Etiqueta, EstadoBadge, PrioridadBadge, ExcedidoBadge, HEX_ESTADO } from '../components/ui'
import type { EstadoProyecto, Prioridad } from '../lib/tipos'

// Landing pública de Tuesday. Las maquetas usan los mismos componentes y colores que la app real.

const sinMovimiento = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// ---------- utilidades ----------

function useIntervalo(fn: () => void, ms: number) {
  const ref = useRef(fn)
  ref.current = fn
  useEffect(() => {
    if (sinMovimiento()) return
    const t = setInterval(() => ref.current(), ms)
    return () => clearInterval(t)
  }, [ms])
}

function useRevelar() {
  useEffect(() => {
    const els = document.querySelectorAll('.revelar')
    if (!('IntersectionObserver' in window)) {
      els.forEach((e) => e.classList.add('visible'))
      return
    }
    const io = new IntersectionObserver(
      (ents) =>
        ents.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('visible')
            io.unobserve(en.target)
          }
        }),
      { threshold: 0.15 },
    )
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [])
}

// Cuenta de 0 al valor al montar
function Contador({ valor, sufijo = '' }: { valor: number; sufijo?: string }) {
  const [n, setN] = useState(sinMovimiento() ? valor : 0)
  useEffect(() => {
    if (sinMovimiento()) return
    let raf = 0
    const t0 = performance.now()
    const paso = (t: number) => {
      const p = Math.min(1, (t - t0) / 1200)
      setN(Math.round(valor * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(paso)
    }
    raf = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(raf)
  }, [valor])
  return <>{n}{sufijo}</>
}

const Barra = ({ pct, color = '#2383e2' }: { pct: number; color?: string }) => (
  <div className="h-1 w-full overflow-hidden rounded-full bg-hover">
    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: color }} />
  </div>
)

// ---------- maqueta de la app ----------

function Ventana({ pagina, emoji, children, color = '#2383e2' }: { pagina: string; emoji: string; children: ReactNode; color?: string }) {
  return (
    <div className="overflow-hidden rounded-xl bg-white text-left shadow-[0_0_0_1px_rgba(15,15,15,.06),0_24px_64px_-16px_rgba(15,15,15,.25)]">
      <div className="flex">
        <div className="hidden w-44 shrink-0 border-r border-linea bg-lateral p-2 md:block">
          <div className="mb-3 flex items-center gap-2 px-1.5 py-1">
            <span className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-semibold text-white transition-colors duration-700" style={{ background: color }}>A</span>
            <span className="text-xs font-medium">Espacio de ACM</span>
          </div>
          <p className="mb-1 px-2 text-[10px] font-medium text-tenue">Espacio de trabajo</p>
          {[['📊', 'Dashboard'], ['🗂️', 'Proyectos']].map(([e, s]) => (
            <div key={s} className={`mb-px flex items-center gap-1.5 rounded-md px-2 py-1 text-xs ${s === pagina ? 'bg-hover font-medium' : 'text-suave'}`}>
              <span className="text-[11px]">{e}</span> {s}
            </div>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex h-8 items-center gap-1 px-3 text-[11px] text-suave">
            ACM <span className="text-tenue">/</span> <span className="text-texto">{emoji} {pagina}</span>
          </div>
          <div className="px-4 pb-5 sm:px-8">
            <div className="text-3xl leading-none">{emoji}</div>
            <p className="mt-1.5 text-xl font-bold tracking-tight">{pagina}</p>
            <div className="mt-3">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardMock() {
  const tiles: [string, number, string][] = [['Proyectos', 24, ''], ['En curso', 12, ''], ['Tareas completadas', 62, '%'], ['Excedidos', 3, '']]
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 rounded-md bg-[#fdebec] px-3 py-2 text-xs">💸 <b className="font-semibold">3 proyectos</b> excedieron su presupuesto.</div>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {tiles.map(([t, v, s]) => (
          <div key={t} className="rounded-md border border-linea p-2.5">
            <p className="text-[10px] text-suave">{t}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums"><Contador valor={v} sufijo={s} /></p>
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-5 gap-2">
        <div className="col-span-2 flex items-center justify-center rounded-md border border-linea p-3">
          <div className="h-20 w-20 rounded-full" style={{ background: `conic-gradient(${HEX_ESTADO.PLANIFICADO} 0 25%, ${HEX_ESTADO.EN_CURSO} 0 75%, ${HEX_ESTADO.COMPLETADO} 0)` }}>
            <div className="m-[20%] h-[60%] w-[60%] rounded-full bg-white" />
          </div>
        </div>
        <div className="col-span-3 rounded-md border border-linea p-3">
          <p className="mb-2 text-[11px] font-medium">Avance global</p>
          <Barra pct={62} />
          <div className="mt-3 space-y-1.5">
            {[['Portal de clientes', 38], ['Data Lake', 59], ['Automatización RRHH', 77]].map(([n, p]) => (
              <div key={n} className="flex items-center gap-2">
                <span className="w-24 truncate text-[10px] text-suave">{n}</span>
                <Barra pct={p as number} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Tablero que se mueve solo: cada pocos segundos una tarjeta avanza de columna
type Tarjeta = { id: string; n: string; p: Prioridad; pct: number }
const INICIAL: Record<EstadoProyecto, Tarjeta[]> = {
  PLANIFICADO: [
    { id: 'a', n: 'Rediseño web', p: 'BAJA', pct: 0 },
    { id: 'b', n: 'Migración a la nube', p: 'ALTA', pct: 0 },
  ],
  EN_CURSO: [
    { id: 'c', n: 'App móvil v2', p: 'MEDIA', pct: 86 },
    { id: 'd', n: 'Portal de clientes', p: 'MEDIA', pct: 38 },
  ],
  COMPLETADO: [{ id: 'e', n: 'ERP Finanzas', p: 'ALTA', pct: 100 }],
}
const FONDO: Record<EstadoProyecto, string> = { PLANIFICADO: 'bg-[#f9f9f8]', EN_CURSO: 'bg-[#f5f9fc]', COMPLETADO: 'bg-[#f6faf6]' }

function TableroVivo() {
  const [cols, setCols] = useState(INICIAL)
  useIntervalo(() => {
    setCols((c) => {
      if (c.EN_CURSO.length === 0 && c.PLANIFICADO.length === 0) return INICIAL
      const nuevo = { PLANIFICADO: [...c.PLANIFICADO], EN_CURSO: [...c.EN_CURSO], COMPLETADO: [...c.COMPLETADO] }
      const t = nuevo.EN_CURSO.shift()
      if (t) nuevo.COMPLETADO.unshift({ ...t, pct: 100 })
      const s = nuevo.PLANIFICADO.shift()
      if (s) nuevo.EN_CURSO.push({ ...s, pct: 24 })
      return nuevo
    })
  }, 2600)
  return (
    <div className="grid grid-cols-3 gap-2">
      {(Object.keys(cols) as EstadoProyecto[]).map((e) => (
        <div key={e} className={`min-h-52 rounded-md p-1.5 ${FONDO[e]}`}>
          <p className="mb-1.5 flex items-center gap-1.5 px-0.5">
            <span className="origin-left scale-90"><EstadoBadge estado={e} /></span>
            <span className="text-[11px] text-tenue">{cols[e].length}</span>
          </p>
          <div className="space-y-1.5">
            {cols[e].map((t) => (
              <div key={t.id} className="sombra-tarjeta anim-aparecer rounded-md bg-white p-2">
                <p className="mb-1.5 truncate text-[11px] font-medium">{t.n}</p>
                <div className="mb-1.5 origin-left scale-90"><PrioridadBadge prioridad={t.p} /></div>
                <Barra pct={t.pct} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function TablaMock() {
  const filas: [string, EstadoProyecto, Prioridad, number, boolean][] = [
    ['Migración a la nube', 'PLANIFICADO', 'ALTA', 0, false],
    ['Portal de clientes', 'EN_CURSO', 'MEDIA', 38, true],
    ['App móvil v2', 'EN_CURSO', 'BAJA', 44, false],
    ['ERP Finanzas', 'COMPLETADO', 'ALTA', 100, false],
    ['Data Lake', 'EN_CURSO', 'MEDIA', 59, false],
  ]
  const grid = 'grid grid-cols-[1.6fr_1.1fr_.8fr_1.1fr_1fr] items-center'
  return (
    <div className="overflow-x-auto text-[11px]">
      <div className="min-w-[520px]">
        <div className={`${grid} border-y border-linea text-suave`}>
          {['Nombre', 'Estado', 'Prioridad', 'Avance', 'Presupuesto'].map((h) => (
            <span key={h} className="border-r border-linea px-2 py-1.5 last:border-r-0">{h}</span>
          ))}
        </div>
        {filas.map(([n, e, p, pct, exc], i) => (
          <div key={n} className={`anim-aparecer ${grid} border-b border-linea`} style={{ animationDelay: `${i * 70}ms` }}>
            <span className="truncate border-r border-linea px-2 py-2 font-medium">📄 {n}</span>
            <span className="origin-left scale-90 border-r border-linea px-2 py-1.5"><EstadoBadge estado={e} /></span>
            <span className="origin-left scale-90 px-2 py-1.5"><PrioridadBadge prioridad={p} /></span>
            <span className="flex items-center gap-1.5 border-x border-linea px-2 py-2.5"><Barra pct={pct} /><span className="w-7 text-tenue">{pct}%</span></span>
            <span className="origin-left scale-90 px-2 py-1.5">{exc ? <ExcedidoBadge /> : <span className="text-tenue">Normal</span>}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const TOUR = [
  { id: 'Dashboard', icono: 'inicio', pagina: 'Dashboard', emoji: '📊', texto: 'El estado del portafolio de un vistazo.', vista: <DashboardMock /> },
  { id: 'Tabla', icono: 'tabla', pagina: 'Proyectos', emoji: '🗂️', texto: 'Filtra por estado o portafolio y carga más bajo demanda.', vista: <TablaMock /> },
  { id: 'Tablero', icono: 'tablero', pagina: 'Proyectos', emoji: '🗂️', texto: 'Arrastra un proyecto y su estado se actualiza.', vista: <TableroVivo /> },
]

function Tour() {
  const [i, setI] = useState(0)
  const [vuelta, setVuelta] = useState(0) // reinicia la barra de progreso al hacer clic
  useIntervalo(() => setI((n) => (n + 1) % TOUR.length), 6000)
  const t = TOUR[i]
  return (
    <div>
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {TOUR.map((x, k) => (
          <button
            key={x.id}
            onClick={() => { setI(k); setVuelta((v) => v + 1) }}
            className={`relative flex items-center gap-1.5 overflow-hidden rounded-full px-4 py-2 text-sm font-medium transition ${
              k === i ? 'bg-texto text-white' : 'bg-white text-suave shadow-[0_0_0_1px_rgba(15,15,15,.08)] hover:text-texto'
            }`}
          >
            <Icono n={x.icono} /> {x.id}
            {k === i && !sinMovimiento() ? (
              <span key={`${i}-${vuelta}`} className="absolute bottom-0 left-0 h-0.5 bg-white/60" style={{ animation: 'progreso 6s linear forwards' }} />
            ) : null}
          </button>
        ))}
      </div>
      <p className="mb-8 text-center text-[17px] text-suave">{t.texto}</p>
      <div key={i} className="anim-aparecer mx-auto max-w-5xl">
        <Ventana pagina={t.pagina} emoji={t.emoji}>{t.vista}</Ventana>
      </div>
    </div>
  )
}

// ---------- visuales de funciones ----------

function VisualPresupuesto() {
  const datos: [string, number][] = [['ERP Finanzas', 72], ['Portal de clientes', 112], ['Data Lake', 54], ['Rediseño web', 104]]
  return (
    <div className="sombra-tarjeta rounded-lg bg-white p-4">
      <div className="space-y-3.5">
        {datos.map(([n, p]) => (
          <div key={n}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium">{n}</span>
              {p > 100 ? <ExcedidoBadge /> : <span className="text-tenue">{p}%</span>}
            </div>
            <div className="h-1.5 rounded-full bg-hover">
              <div className="revelar-ancho h-full rounded-full" style={{ ['--w' as string]: `${Math.min(p, 100)}%`, background: p > 100 ? '#e16f64' : '#cb912f' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function VisualPrioridad() {
  const items: [string, Prioridad][] = [['Rediseño web', 'BAJA'], ['Portal de clientes', 'MEDIA'], ['Migración a la nube', 'ALTA'], ['App móvil v2', 'BAJA'], ['Data Lake', 'ALTA']]
  const peso = { ALTA: 0, MEDIA: 1, BAJA: 2 }
  const [porPrioridad, setPorPrioridad] = useState(false)
  useIntervalo(() => setPorPrioridad((v) => !v), 2800)
  const orden = porPrioridad ? [...items].sort((a, b) => peso[a[1]] - peso[b[1]]) : items
  return (
    <div className="sombra-tarjeta rounded-lg bg-white p-4">
      <p className="mb-3 flex items-center gap-1.5 text-xs text-suave">
        Ordenar por
        <Etiqueta color={porPrioridad ? 'morado' : 'gris'}>{porPrioridad ? 'Prioridad' : 'Fecha'}</Etiqueta>
      </p>
      <div className="relative h-[180px]">
        {items.map(([n, p]) => (
          <div
            key={n}
            className="absolute inset-x-0 flex h-8 items-center justify-between border-b border-linea px-1 transition-all duration-700"
            style={{ top: orden.findIndex((o) => o[0] === n) * 36 }}
          >
            <span className="text-xs font-medium">📄 {n}</span>
            <PrioridadBadge prioridad={p} />
          </div>
        ))}
      </div>
    </div>
  )
}

const ORGS: [string, string][] = [['ACM', '#7c5cfa'], ['Oracle', '#e8508f'], ['Ludoteca', '#0f9b84']]
function VisualOrgs() {
  const [i, setI] = useState(0)
  useIntervalo(() => setI((n) => (n + 1) % ORGS.length), 2200)
  const [nombre, color] = ORGS[i]
  return (
    <div className="sombra-tarjeta rounded-lg bg-white p-2">
      {ORGS.map(([n, c], k) => (
        <div key={n} className={`flex h-9 items-center gap-2 rounded-md px-2 text-sm transition ${k === i ? 'bg-hover' : ''}`}>
          <span className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-semibold text-white" style={{ background: c }}>{n[0]}</span>
          <span className={k === i ? 'font-medium' : 'text-suave'}>Espacio de {n}</span>
          {k === i ? <Icono n="check" className="ml-auto h-4 w-4 text-suave" /> : null}
        </div>
      ))}
      <div className="mt-2 border-t border-linea px-2 pt-3">
        <div className="space-y-2.5">
          {[70, 45, 90].map((p, k) => (
            <div key={k} className="flex items-center gap-3">
              <span className="h-1.5 w-16 rounded-full bg-hover" />
              <Barra pct={p} color={color} />
            </div>
          ))}
        </div>
        <span className="mt-3 flex h-7 w-full items-center justify-center rounded-md text-xs font-medium text-white transition-colors duration-700" style={{ background: color }}>
          + Nuevo en {nombre}
        </span>
      </div>
    </div>
  )
}

const FUNCIONES = [
  {
    emoji: '💸',
    titulo: 'Presupuestos bajo control',
    texto: 'Cada proyecto indica si su gasto sigue dentro de lo planificado. Los excedidos se marcan en la tabla, el tablero y el dashboard.',
    visual: <VisualPresupuesto />,
  },
  {
    emoji: '🚩',
    titulo: 'Prioridades claras',
    texto: 'Asigna prioridad alta, media o baja y ordena el portafolio para que el equipo sepa dónde poner su energía.',
    visual: <VisualPrioridad />,
  },
  {
    emoji: '🏢',
    titulo: 'Un espacio por organización',
    texto: 'Los datos están aislados por organización desde el backend. La interfaz adopta el color de cada una.',
    visual: <VisualOrgs />,
  },
]

// ---------- página ----------

const BotonAzul = ({ to, children }: { to: string; children: ReactNode }) => (
  <Link to={to} className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-azul px-4 text-[15px] font-medium text-white transition hover:bg-[#0077d4]">
    {children}
  </Link>
)

export default function Landing() {
  useRevelar()
  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-texto">
      <style>{`
        @keyframes progreso { from { width: 0 } to { width: 100% } }
        .revelar-ancho { width: 0; transition: width 1.2s cubic-bezier(.2,.7,.3,1) .2s }
        .visible .revelar-ancho { width: var(--w) }
        @media (prefers-reduced-motion: reduce) { .revelar-ancho { width: var(--w); transition: none } }
      `}</style>

      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-1 text-[15px] text-suave md:flex">
            {[['#producto', 'Producto'], ['#funciones', 'Funciones']].map(([h, t]) => (
              <a key={h} href={h} className="rounded-md px-3 py-1.5 transition hover:bg-hover hover:text-texto">{t}</a>
            ))}
          </nav>
          <div className="flex items-center gap-1.5">
            <Link to="/login" className="hidden rounded-md px-3 py-1.5 text-[15px] text-suave transition hover:bg-hover hover:text-texto sm:inline-flex">
              Iniciar sesión
            </Link>
            <Link to="/login" className="inline-flex h-8 items-center rounded-md bg-texto px-3 text-sm font-medium text-white transition hover:bg-black">
              Entrar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
        <div className="anim-aparecer mx-auto max-w-3xl text-center">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-bloque px-3 py-1 text-sm text-suave">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6c9b7d]" /> Gestión de portafolio de proyectos
          </p>
          <h1 className="text-[44px] font-bold leading-[1.05] tracking-[-0.035em] sm:text-7xl">
            Todos tus proyectos.
            <br />
            Un solo espacio.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-suave sm:text-xl">
            Tuesday reúne el avance, el presupuesto y las prioridades de cada proyecto, para que tu organización decida con datos y no con hojas de cálculo sueltas.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <BotonAzul to="/login">Entrar a mi organización <Icono n="flecha" /></BotonAzul>
            <a href="#producto" className="inline-flex h-10 items-center rounded-lg bg-[#e6f1fb] px-4 text-[15px] font-medium text-azul transition hover:bg-[#d8e9f9]">
              Ver el producto
            </a>
          </div>
        </div>

        <div className="anim-aparecer mx-auto mt-16 max-w-5xl" style={{ animationDelay: '.12s' }}>
          <Ventana pagina="Proyectos" emoji="🗂️">
            <div className="mb-2 flex items-center gap-3 border-b border-linea text-[11px]">
              <span className="flex items-center gap-1 border-b-2 border-texto pb-1.5 font-medium"><Icono n="tablero" className="h-3 w-3" /> Tablero</span>
              <span className="flex items-center gap-1 pb-1.5 text-suave"><Icono n="tabla" className="h-3 w-3" /> Tabla</span>
            </div>
            <TableroVivo />
          </Ventana>
        </div>
      </section>

      {/* Valores */}
      <section className="px-4 sm:px-6">
        <div className="mx-auto grid max-w-5xl gap-8 border-y border-linea py-12 md:grid-cols-3">
          {[
            ['👀', 'Visibilidad', 'Estado, avance y presupuesto de cada proyecto en una sola vista.'],
            ['🎯', 'Control', 'Alertas de presupuesto excedido y prioridades explícitas.'],
            ['🔒', 'Aislamiento', 'Cada organización trabaja en su propio espacio, sin mezclar datos.'],
          ].map(([e, t, d], k) => (
            <div key={t} className="revelar" style={{ transitionDelay: `${k * 90}ms` }}>
              <p className="text-2xl">{e}</p>
              <p className="mt-2 text-[17px] font-semibold">{t}</p>
              <p className="mt-1 text-[15px] leading-relaxed text-suave">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recorrido */}
      <section id="producto" className="scroll-mt-16 px-4 py-24 sm:px-6">
        <div className="revelar mx-auto mb-8 max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-[-0.03em] sm:text-5xl">Tres vistas, un portafolio</h2>
        </div>
        <Tour />
      </section>

      {/* Funciones */}
      <section id="funciones" className="scroll-mt-16 px-4 pb-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="revelar mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-4xl font-bold tracking-[-0.03em] sm:text-5xl">Hecho para decidir</h2>
            <p className="mt-4 text-lg text-suave">Lo justo para saber qué va bien, qué se atrasa y dónde intervenir.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {FUNCIONES.map((f, k) => (
              <div key={f.titulo} className="revelar flex flex-col rounded-2xl bg-[#f6f5f4] p-6" style={{ transitionDelay: `${k * 90}ms` }}>
                <p className="text-2xl">{f.emoji}</p>
                <h3 className="mt-3 text-xl font-semibold tracking-tight">{f.titulo}</h3>
                <p className="mb-6 mt-2 text-[15px] leading-relaxed text-suave">{f.texto}</p>
                <div className="mt-auto">{f.visual}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Llamado final */}
      <section className="px-4 pb-28 sm:px-6">
        <div className="revelar mx-auto max-w-3xl text-center">
          <p className="text-5xl">🗂️</p>
          <h2 className="mt-4 text-4xl font-bold tracking-[-0.03em] sm:text-6xl">Tu portafolio, ordenado desde el primer día.</h2>
          <p className="mt-4 text-lg text-suave">Entra con las credenciales de tu organización.</p>
          <div className="mt-8 flex justify-center">
            <BotonAzul to="/login">Iniciar sesión <Icono n="flecha" /></BotonAzul>
          </div>
        </div>
      </section>

      <footer className="border-t border-linea px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <Logo />
            <p className="mt-2 text-sm text-tenue">Gestión de portafolio de proyectos.</p>
          </div>
          <div className="flex gap-1 text-sm text-suave">
            <a href="#producto" className="rounded-md px-2 py-1 hover:bg-hover hover:text-texto">Producto</a>
            <a href="#funciones" className="rounded-md px-2 py-1 hover:bg-hover hover:text-texto">Funciones</a>
            <Link to="/login" className="rounded-md px-2 py-1 hover:bg-hover hover:text-texto">Iniciar sesión</Link>
          </div>
          <p className="text-sm text-tenue">© {new Date().getFullYear()} Tuesday</p>
        </div>
      </footer>
    </div>
  )
}
