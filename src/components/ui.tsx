import { useEffect, type ReactNode } from 'react'
import { ETIQUETA_ESTADO, type EstadoProyecto, type Prioridad } from '../lib/tipos'
import { Icono } from './Iconos'

// ---------- Etiquetas con la paleta apagada de Notion ----------

export type ColorEtiqueta = 'gris' | 'azul' | 'verde' | 'amarillo' | 'rojo' | 'morado'

const COLOR: Record<ColorEtiqueta, { fondo: string; punto: string }> = {
  gris: { fondo: 'bg-[#e3e2e0] text-[#32302c]', punto: 'bg-[#91918e]' },
  azul: { fondo: 'bg-[#d3e5ef] text-[#183347]', punto: 'bg-[#5b97bd]' },
  verde: { fondo: 'bg-[#dbeddb] text-[#1c3829]', punto: 'bg-[#6c9b7d]' },
  amarillo: { fondo: 'bg-[#fdecc8] text-[#402c1b]', punto: 'bg-[#cb912f]' },
  rojo: { fondo: 'bg-[#ffe2dd] text-[#5d1715]', punto: 'bg-[#e16f64]' },
  morado: { fondo: 'bg-[#e8deee] text-[#412454]', punto: 'bg-[#a782c3]' },
}

export const COLOR_ESTADO: Record<EstadoProyecto, ColorEtiqueta> = {
  PLANIFICADO: 'gris',
  EN_CURSO: 'azul',
  COMPLETADO: 'verde',
}
// Colores para gráficos (mismos tonos que los puntos de estado)
export const HEX_ESTADO: Record<EstadoProyecto, string> = {
  PLANIFICADO: '#c7c6c3',
  EN_CURSO: '#5b97bd',
  COMPLETADO: '#6c9b7d',
}
const COLOR_PRIORIDAD: Record<Prioridad, ColorEtiqueta> = { ALTA: 'rojo', MEDIA: 'amarillo', BAJA: 'gris' }
const ETIQUETA_PRIORIDAD: Record<Prioridad, string> = { ALTA: 'Alta', MEDIA: 'Media', BAJA: 'Baja' }

const base = 'inline-flex h-5 items-center gap-1.5 whitespace-nowrap rounded-[4px] px-1.5 text-[13px] leading-none'

export const Etiqueta = ({ color, punto, children }: { color: ColorEtiqueta; punto?: boolean; children: ReactNode }) => (
  <span className={`${base} ${COLOR[color].fondo} ${punto ? 'rounded-full pl-2 pr-2' : ''}`}>
    {punto ? <span className={`h-2 w-2 rounded-full ${COLOR[color].punto}`} /> : null}
    {children}
  </span>
)

// Estado = propiedad "status" de Notion (píldora con punto)
export const EstadoBadge = ({ estado }: { estado: EstadoProyecto }) => (
  <Etiqueta color={COLOR_ESTADO[estado]} punto>
    {ETIQUETA_ESTADO[estado]}
  </Etiqueta>
)

export const PrioridadBadge = ({ prioridad }: { prioridad: Prioridad }) => (
  <Etiqueta color={COLOR_PRIORIDAD[prioridad]}>{ETIQUETA_PRIORIDAD[prioridad]}</Etiqueta>
)

export const ExcedidoBadge = () => <Etiqueta color="rojo">⚠ Excedido</Etiqueta>

export const Avance = ({ pct }: { pct: number }) => (
  <div className="flex items-center gap-2">
    <div className="h-1 w-16 overflow-hidden rounded-full bg-hover">
      <div className="h-full rounded-full bg-acento transition-all duration-700" style={{ width: `${pct}%` }} />
    </div>
    <span className="w-8 text-xs tabular-nums text-suave">{pct}%</span>
  </div>
)

// ---------- Encabezado de página (ícono grande + título, como una página de Notion) ----------

export const Encabezado = ({
  icono,
  titulo,
  descripcion,
  acciones,
}: {
  icono: string
  titulo: string
  descripcion?: string
  acciones?: ReactNode
}) => (
  <div className="pb-6 pt-8 sm:pt-14">
    <div className="mb-2 text-[56px] leading-none sm:text-[64px]" aria-hidden="true">
      {icono}
    </div>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-[32px] font-bold leading-tight tracking-[-0.02em] sm:text-[40px]">{titulo}</h1>
        {descripcion ? <p className="mt-1 text-[15px] text-suave">{descripcion}</p> : null}
      </div>
      {acciones}
    </div>
  </div>
)

// ---------- Modal tipo "vista previa de página" ----------

export function Modal({
  titulo,
  onCerrar,
  children,
  ancho = 'max-w-md',
}: {
  titulo?: string
  onCerrar: () => void
  children: ReactNode
  ancho?: string
}) {
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [onCerrar])

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(15,15,15,0.45)] p-4 pt-[8vh]"
      onMouseDown={onCerrar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className={`anim-emerger sombra-flotante w-full rounded-xl bg-white ${ancho}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex h-11 items-center justify-between px-3">
          <span className="flex items-center gap-1.5 px-1 text-sm text-suave">
            {titulo ? (
              <>
                <Icono n="pagina" className="h-4 w-4" /> {titulo}
              </>
            ) : null}
          </span>
          <button
            onClick={onCerrar}
            className="flex h-7 w-7 items-center justify-center rounded-md text-tenue transition hover:bg-hover hover:text-texto"
            aria-label="Cerrar"
          >
            <Icono n="cerrar" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ---------- Formularios ----------

export const Campo = ({ etiqueta, children }: { etiqueta: string; children: ReactNode }) => (
  <label className="mb-4 block">
    <span className="mb-1.5 block text-xs font-medium text-suave">{etiqueta}</span>
    {children}
  </label>
)

export const entrada =
  'h-9 w-full rounded-md border border-[rgba(55,53,47,0.16)] bg-[#fffefc] px-2.5 text-sm text-texto shadow-[inset_0_1px_1px_rgba(15,15,15,0.04)] outline-none transition placeholder:text-tenue focus:border-azul focus:ring-[3px] focus:ring-azul/20'

// Select/entrada "sin borde" que sólo se marca al pasar el mouse, como las propiedades de Notion
export const entradaSutil =
  'h-8 w-full cursor-pointer rounded-md bg-transparent px-2 text-sm text-texto outline-none transition hover:bg-hover focus:bg-hover'

export const BotonPrimario = ({ className = '', ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...p}
    className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-acento px-3 text-sm font-medium text-white shadow-[inset_0_-1px_0_rgba(15,15,15,0.1)] transition hover:brightness-95 active:brightness-90 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
  />
)

export const BotonSecundario = ({ className = '', ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...p}
    className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-sm text-suave transition hover:bg-hover hover:text-texto ${className}`}
  />
)

// ---------- Estados de carga / error ----------

export const Cargando = ({ texto = 'Cargando…' }: { texto?: string }) => (
  <div className="space-y-2 py-6" aria-label={texto}>
    {[80, 60, 70].map((w, i) => (
      <div key={i} className="h-4 animate-pulse rounded bg-hover" style={{ width: `${w}%` }} />
    ))}
  </div>
)

export const ErrorMsg = ({ error }: { error: unknown }) => (
  <div className="flex items-start gap-2.5 rounded-md bg-[#fdebec] px-3 py-2.5 text-sm text-[#5d1715]">
    <span aria-hidden="true">⚠️</span>
    <span>{error instanceof Error ? error.message : 'Ocurrió un error'}</span>
  </div>
)

// Bloque "callout" de Notion
export const Callout = ({ icono, children, tono = 'gris' }: { icono: string; children: ReactNode; tono?: 'gris' | 'rojo' | 'verde' }) => {
  const fondo = { gris: 'bg-bloque', rojo: 'bg-[#fdebec]', verde: 'bg-[#edf3ec]' }[tono]
  return (
    <div className={`flex items-start gap-3 rounded-md px-4 py-3.5 text-[15px] ${fondo}`}>
      <span className="text-lg leading-6" aria-hidden="true">
        {icono}
      </span>
      <div className="leading-6">{children}</div>
    </div>
  )
}
