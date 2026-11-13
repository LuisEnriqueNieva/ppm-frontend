// Piezas compartidas por las pantallas nuevas. Todo se construye con los componentes de ui.tsx
// (mismo diseño de siempre); aquí sólo se juntan en patrones que se repiten.
import { useState, type FormEvent, type ReactNode } from 'react'
import { BotonPrimario, BotonSecundario, Cargando, ErrorMsg, Modal } from './ui'
import { Icono } from './Iconos'

export const numero = (n?: number | null, dec = 2) =>
  n == null ? '—' : Number(n).toLocaleString('es-PE', { minimumFractionDigits: dec, maximumFractionDigits: dec })

export const bytes = (n: number) =>
  n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(1)} MB`

// ---------- Pestañas (misma barra que Proyectos: Tabla / Tablero) ----------
export function Pestanas<T extends string>({ items, activa, onCambiar }: {
  items: { id: T; nombre: string; icono: string }[]
  activa: T
  onCambiar: (id: T) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-linea" role="tablist">
      {items.map((v) => (
        <button
          key={v.id}
          role="tab"
          aria-selected={activa === v.id}
          onClick={() => onCambiar(v.id)}
          className={`relative flex h-10 items-center gap-1.5 px-2 text-sm transition ${
            activa === v.id ? 'font-medium text-texto' : 'text-suave hover:text-texto'
          }`}
        >
          <Icono n={v.icono} /> {v.nombre}
          {activa === v.id ? <span className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-texto" /> : null}
        </button>
      ))}
    </div>
  )
}

// ---------- Tabla (mismo estilo que VistaTabla) ----------
const celda = 'h-[37px] border-r border-linea px-2 last:border-r-0'

export interface Fila {
  key: string
  celdas: ReactNode[]
  onClick?: () => void
}

export function Tabla({ columnas, filas, vacio = 'No hay registros.', pie }: {
  columnas: [string, string, string?][] // [nombre, icono, ancho]
  filas: Fila[]
  vacio?: string
  pie?: ReactNode
}) {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse whitespace-nowrap text-left text-sm">
          <thead>
            <tr className="border-b border-linea">
              {columnas.map(([h, icono, ancho]) => (
                <th key={h} className={`${celda} ${ancho ?? ''} font-normal text-suave`}>
                  <span className="flex items-center gap-1.5">
                    <Icono n={icono} className="h-3.5 w-3.5" /> {h}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr
                key={f.key}
                onClick={f.onClick}
                className={`border-b border-linea transition hover:bg-[#fbfbfa] ${f.onClick ? 'cursor-pointer' : ''}`}
              >
                {f.celdas.map((c, i) => (
                  <td key={i} className={celda}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filas.length === 0 ? <p className="border-b border-linea py-10 text-center text-sm text-tenue">{vacio}</p> : null}
      {pie}
    </div>
  )
}

// Fila "+ Nuevo ..." al pie de una tabla
export const FilaNuevo = ({ texto, onClick }: { texto: string; onClick: () => void }) => (
  <button onClick={onClick} className="flex h-[34px] w-full items-center gap-1.5 border-b border-linea px-2 text-sm text-tenue transition hover:bg-hover">
    <Icono n="mas" className="h-3.5 w-3.5" /> {texto}
  </button>
)

// Pie con el contador y "Cargar más"
export function PieLista({ cantidad, hayMas, cargando, onMas }: { cantidad: number; hayMas?: boolean; cargando?: boolean; onMas: () => void }) {
  return (
    <div className="flex h-9 items-center justify-between px-2 text-xs text-tenue">
      <span>
        <span className="uppercase tracking-wide">Cuenta</span> <span className="text-suave">{cantidad}</span>
      </span>
      {hayMas ? (
        <button onClick={onMas} disabled={cargando} className="rounded-md px-2 py-1 text-sm text-suave transition hover:bg-hover hover:text-texto disabled:opacity-50">
          {cargando ? 'Cargando…' : 'Cargar más'}
        </button>
      ) : null}
    </div>
  )
}

// ---------- Estados ----------
export function Estado({ q, children }: { q: { isLoading: boolean; error: unknown }; children: ReactNode }) {
  if (q.isLoading) return <Cargando />
  if (q.error) return <div className="pt-3"><ErrorMsg error={q.error} /></div>
  return <>{children}</>
}

// Barra de título de sección dentro de una pestaña
export const BarraSeccion = ({ titulo, children }: { titulo: string; children?: ReactNode }) => (
  <div className="flex flex-wrap items-center justify-between gap-2 py-3">
    <h2 className="text-xs font-medium text-suave">{titulo}</h2>
    <div className="flex items-center gap-2">{children}</div>
  </div>
)

// Propiedad: etiqueta gris a la izquierda y valor a la derecha (igual que en NuevoProyecto)
export const Propiedad = ({ icono, etiqueta, children }: { icono: string; etiqueta: string; children: ReactNode }) => (
  <div className="flex min-h-[34px] items-center gap-2">
    <span className="flex w-32 shrink-0 items-center gap-1.5 px-1 text-sm text-suave sm:w-40">
      <Icono n={icono} /> {etiqueta}
    </span>
    <span className="min-w-0 flex-1 px-2 text-sm">{children}</span>
  </div>
)

// Tarjeta de cifra (monto, gasto, ...)
export const Cifra = ({ etiqueta, valor, pie }: { etiqueta: string; valor: ReactNode; pie?: ReactNode }) => (
  <div className="sombra-tarjeta rounded-lg bg-white p-4">
    <p className="text-xs text-suave">{etiqueta}</p>
    <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">{valor}</p>
    {pie ? <div className="mt-1 text-xs text-tenue">{pie}</div> : null}
  </div>
)

// ---------- Modales ----------
export function ModalForm({ titulo, onCerrar, onEnviar, etiqueta = 'Guardar', cargando, error, deshabilitado, children, ancho = 'max-w-md', izquierda }: {
  titulo: string
  onCerrar: () => void
  onEnviar: () => void
  etiqueta?: string
  cargando?: boolean
  error?: unknown
  deshabilitado?: boolean
  children: ReactNode
  ancho?: string
  izquierda?: ReactNode
}) {
  const enviar = (e: FormEvent) => {
    e.preventDefault()
    onEnviar()
  }
  return (
    <Modal titulo={titulo} onCerrar={onCerrar} ancho={ancho}>
      <form onSubmit={enviar} className="px-6 pb-5">
        {children}
        {error ? <div className="mb-4"><ErrorMsg error={error} /></div> : null}
        <div className="flex items-center justify-between gap-2">
          <div>{izquierda}</div>
          <div className="flex items-center gap-2">
            <BotonSecundario type="button" onClick={onCerrar}>Cancelar</BotonSecundario>
            <BotonPrimario type="submit" disabled={cargando || deshabilitado}>{cargando ? 'Guardando…' : etiqueta}</BotonPrimario>
          </div>
        </div>
      </form>
    </Modal>
  )
}

export function ModalConfirmar({ titulo, texto, etiqueta = 'Eliminar', onConfirmar, onCerrar, cargando, error }: {
  titulo: string
  texto: string
  etiqueta?: string
  onConfirmar: () => void
  onCerrar: () => void
  cargando?: boolean
  error?: unknown
}) {
  return (
    <Modal titulo={titulo} onCerrar={onCerrar}>
      <div className="px-6 pb-5">
        <p className="mb-4 text-[15px] leading-6">{texto}</p>
        {error ? <div className="mb-4"><ErrorMsg error={error} /></div> : null}
        <div className="flex justify-end gap-2">
          <BotonSecundario onClick={onCerrar}>Cancelar</BotonSecundario>
          <BotonPrimario onClick={onConfirmar} disabled={cargando} className="!bg-[#e16f64]">
            {cargando ? 'Eliminando…' : etiqueta}
          </BotonPrimario>
        </div>
      </div>
    </Modal>
  )
}

// Botones de ícono para editar / eliminar
export const BotonIcono = ({ icono, titulo, onClick }: { icono: string; titulo: string; onClick: () => void }) => (
  <button
    title={titulo}
    aria-label={titulo}
    onClick={(e) => { e.stopPropagation(); onClick() }}
    className="flex h-7 w-7 items-center justify-center rounded-md text-tenue transition hover:bg-hover hover:text-texto"
  >
    <Icono n={icono} />
  </button>
)

// Estado local de un modal abierto/cerrado con un valor opcional
export function useModal<T = true>() {
  const [valor, setValor] = useState<T | null>(null)
  return { valor, abrir: (v: T = true as T) => setValor(v), cerrar: () => setValor(null) }
}

// Convierte el texto de un <input> a número (o undefined si está vacío)
export const aNumero = (s: string) => (s.trim() === '' ? undefined : Number(s))
