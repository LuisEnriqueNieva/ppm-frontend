import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useProyectos, useResumen } from '../lib/hooks'
import { fecha } from '../lib/formato'
import { ESTADOS, ETIQUETA_ESTADO, type Proyecto } from '../lib/tipos'
import { Avance, Cargando, ErrorMsg, EstadoBadge, ExcedidoBadge, HEX_ESTADO, PrioridadBadge } from '../components/ui'
import { Icono } from '../components/Iconos'

// ---------- utilidades ----------

const saludo = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'
}
const hoyTexto = () => {
  const t = new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })
  return t.charAt(0).toUpperCase() + t.slice(1)
}

// Días que faltan hasta una fecha 'YYYY-MM-DD' (negativo = vencido)
const diasHasta = (f?: string) => {
  if (!f) return null
  const [a, m, d] = f.slice(0, 10).split('-').map(Number)
  const hoy = new Date()
  const base = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  return Math.round((Date.UTC(a, m - 1, d) - base) / 86_400_000)
}
const textoDias = (n: number) =>
  n < 0 ? `Vencido hace ${-n} ${-n === 1 ? 'día' : 'días'}` : n === 0 ? 'Vence hoy' : n === 1 ? 'Mañana' : `En ${n} días`

// ---------- piezas ----------

// Título de sección pequeño y gris, como en el Inicio de Notion
const Seccion = ({ icono, titulo, extra, children }: { icono: string; titulo: string; extra?: ReactNode; children: ReactNode }) => (
  <section className="mt-10">
    <div className="mb-3 flex items-center justify-between px-0.5">
      <h2 className="flex items-center gap-1.5 text-xs font-medium text-suave">
        <Icono n={icono} className="h-3.5 w-3.5" /> {titulo}
      </h2>
      {extra}
    </div>
    {children}
  </section>
)

const VerTodo = () => (
  <Link to="/proyectos" className="rounded-md px-1.5 py-0.5 text-xs text-tenue transition hover:bg-hover hover:text-suave">
    Ver todos
  </Link>
)

const Vacio = ({ children }: { children: ReactNode }) => (
  <p className="rounded-lg border border-dashed border-linea px-4 py-6 text-center text-sm text-tenue">{children}</p>
)

// Tarjeta de galería: franja superior teñida con el color de la organización
function TarjetaProyecto({ p }: { p: Proyecto }) {
  const dias = diasHasta(p.fecha_fin)
  return (
    <Link
      to="/proyectos"
      className="sombra-tarjeta group flex w-56 shrink-0 flex-col overflow-hidden rounded-xl bg-white transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative h-14 bg-acento/10">
        <span className="absolute -bottom-3 left-3 text-[28px] leading-none">📄</span>
      </div>
      <div className="flex flex-1 flex-col p-3 pt-5">
        <p className="truncate text-sm font-medium">{p.nombre}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          <PrioridadBadge prioridad={p.prioridad} />
          {p.estado_presupuesto === 'EXCEDIDO' ? <ExcedidoBadge /> : null}
        </div>
        <div className="mt-auto pt-3">
          <Avance pct={p.avance_pct} />
          <p className="mt-1 text-xs text-tenue">{dias === null ? 'Sin fecha de fin' : textoDias(dias)}</p>
        </div>
      </div>
    </Link>
  )
}

// Fila tipo lista de base de datos
const Fila = ({ p, derecha }: { p: Proyecto; derecha: ReactNode }) => (
  <Link to="/proyectos" className="flex h-10 items-center gap-2 border-b border-linea px-1.5 text-sm transition last:border-b-0 hover:bg-hover">
    <Icono n="pagina" className="h-4 w-4 text-tenue" />
    <span className="min-w-0 flex-1 truncate">{p.nombre}</span>
    {derecha}
  </Link>
)

// ---------- página ----------

export default function Dashboard() {
  const { sesion } = useAuth()
  const resumen = useResumen()
  const lista = useProyectos({}, 50)

  const r = resumen.data
  const proyectos = lista.data?.pages.flatMap((p) => p.items) ?? []

  const total = r?.total_proyectos ?? 0
  const tt = r?.tareas_total ?? 0
  const tc = r?.tareas_completadas ?? 0
  const pctTareas = tt ? Math.round((100 * tc) / tt) : 0
  const excedidos = r?.presupuestos_excedidos ?? 0
  const porEstado = ESTADOS.map((e) => ({ e, n: r?.[`proy_${e}`] ?? 0 }))

  const enCurso = proyectos.filter((p) => p.estado === 'EN_CURSO').sort((a, b) => b.avance_pct - a.avance_pct)
  const abiertos = proyectos.filter((p) => p.estado !== 'COMPLETADO')

  // Requiere atención: presupuesto excedido, vencidos o prioridad alta sin avance
  const atencion = abiertos
    .map((p) => {
      const d = diasHasta(p.fecha_fin)
      const motivo =
        p.estado_presupuesto === 'EXCEDIDO' ? 'excedido'
        : d !== null && d < 0 ? 'vencido'
        : p.prioridad === 'ALTA' && p.avance_pct === 0 ? 'sin-iniciar'
        : null
      return { p, d, motivo }
    })
    .filter((x) => x.motivo)

  const proximos = abiertos
    .map((p) => ({ p, d: diasHasta(p.fecha_fin) }))
    .filter((x): x is { p: Proyecto; d: number } => x.d !== null && x.d >= 0)
    .sort((a, b) => a.d - b.d)
    .slice(0, 6)

  return (
    <div className="pb-8">
      {/* Saludo */}
      <div className="pb-2 pt-10 sm:pt-16">
        <p className="text-sm text-tenue">{hoyTexto()}</p>
        <h1 className="mt-1 text-[32px] font-bold leading-tight tracking-[-0.02em] sm:text-[40px]">
          {saludo()}, {sesion?.usuario_id}
        </h1>
      </div>

      {resumen.error ? <div className="mt-6"><ErrorMsg error={resumen.error} /></div> : null}

      {/* Cifras clave en una sola franja */}
      <Seccion icono="inicio" titulo="Resumen">
        {resumen.isLoading ? (
          <Cargando />
        ) : (
          <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-linea lg:grid-cols-4">
            {[
              { t: 'Proyectos', v: total.toLocaleString(), d: `${(r?.proy_EN_CURSO ?? 0).toLocaleString()} en curso` },
              { t: 'Tareas completadas', v: `${pctTareas}%`, d: `${tc.toLocaleString()} de ${tt.toLocaleString()}` },
              { t: 'Completados', v: (r?.proy_COMPLETADO ?? 0).toLocaleString(), d: total ? `${Math.round((100 * (r?.proy_COMPLETADO ?? 0)) / total)}% del portafolio` : '—' },
              { t: 'Presupuestos excedidos', v: excedidos.toLocaleString(), d: excedidos ? 'Requieren revisión' : 'Todo en orden', alerta: excedidos > 0 },
            ].map((k, i) => (
              <div
                key={k.t}
                className={`p-4 ${i % 2 ? 'border-l' : ''} ${i >= 2 ? 'border-t lg:border-t-0' : ''} ${i === 2 ? 'lg:border-l' : ''} border-linea`}
              >
                <p className="text-sm text-suave">{k.t}</p>
                <p className={`mt-1.5 text-[28px] font-semibold leading-none tracking-tight tabular-nums ${k.alerta ? 'text-[#c4554d]' : ''}`}>{k.v}</p>
                <p className="mt-1.5 text-xs text-tenue">{k.d}</p>
              </div>
            ))}
          </div>
        )}

        {/* Distribución por estado: una sola barra apilada */}
        {!resumen.isLoading && total > 0 ? (
          <div className="mt-4">
            <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full">
              {porEstado.map(({ e, n }) =>
                n ? <div key={e} className="h-full transition-all duration-700" style={{ width: `${(100 * n) / total}%`, background: HEX_ESTADO[e] }} title={`${ETIQUETA_ESTADO[e]}: ${n}`} /> : null,
              )}
            </div>
            <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-suave">
              {porEstado.map(({ e, n }) => (
                <span key={e} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: HEX_ESTADO[e] }} />
                  {ETIQUETA_ESTADO[e]}
                  <span className="tabular-nums text-tenue">{n.toLocaleString()}</span>
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </Seccion>

      {/* Galería de proyectos en curso */}
      <Seccion icono="progreso" titulo="En curso" extra={<VerTodo />}>
        {lista.isLoading ? (
          <Cargando />
        ) : lista.error ? (
          <ErrorMsg error={lista.error} />
        ) : enCurso.length ? (
          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-3 pt-1">
            {enCurso.map((p) => <TarjetaProyecto key={p.proyecto_id} p={p} />)}
          </div>
        ) : (
          <Vacio>No hay proyectos en curso.</Vacio>
        )}
      </Seccion>

      {/* Listas accionables */}
      <div className="grid grid-cols-1 gap-x-10 lg:grid-cols-2">
        <Seccion icono="bandera" titulo="Requiere atención">
          {lista.isLoading ? (
            <Cargando />
          ) : atencion.length ? (
            <div className="rounded-xl border border-linea px-1.5 py-1">
              {atencion.map(({ p, d, motivo }) => (
                <Fila
                  key={p.proyecto_id}
                  p={p}
                  derecha={
                    motivo === 'excedido' ? <ExcedidoBadge />
                    : motivo === 'vencido' ? <span className="text-xs text-[#c4554d]">{textoDias(d!)}</span>
                    : <span className="flex items-center gap-1.5 text-xs text-tenue"><PrioridadBadge prioridad="ALTA" /> sin iniciar</span>
                  }
                />
              ))}
            </div>
          ) : (
            <Vacio>✅ Nada urgente por ahora.</Vacio>
          )}
        </Seccion>

        <Seccion icono="calendario" titulo="Próximos vencimientos">
          {lista.isLoading ? (
            <Cargando />
          ) : proximos.length ? (
            <div className="rounded-xl border border-linea px-1.5 py-1">
              {proximos.map(({ p, d }) => (
                <Fila
                  key={p.proyecto_id}
                  p={p}
                  derecha={
                    <span className="flex items-center gap-2">
                      <span className="hidden sm:inline"><EstadoBadge estado={p.estado} /></span>
                      <span className={`w-24 text-right text-xs ${d <= 7 ? 'font-medium text-[#b7791f]' : 'text-tenue'}`} title={fecha(p.fecha_fin)}>
                        {textoDias(d)}
                      </span>
                    </span>
                  }
                />
              ))}
            </div>
          ) : (
            <Vacio>No hay vencimientos próximos.</Vacio>
          )}
        </Seccion>
      </div>
    </div>
  )
}
