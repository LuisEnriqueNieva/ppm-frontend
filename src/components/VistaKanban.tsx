import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { put } from '../lib/api'
import { useProyectos } from '../lib/hooks'
import { fecha } from '../lib/formato'
import { ESTADOS, type EstadoProyecto, type Proyecto } from '../lib/tipos'
import { Icono } from './Iconos'
import { AccionesProyecto } from './AccionesProyecto'
import { Avance, Cargando, ErrorMsg, EstadoBadge, ExcedidoBadge, PrioridadBadge } from './ui'

// Fondo levemente teñido por grupo, como los tableros de Notion
const FONDO_COLUMNA: Record<EstadoProyecto, string> = {
  PLANIFICADO: 'bg-[#f9f9f8]',
  EN_CURSO: 'bg-[#f5f9fc]',
  COMPLETADO: 'bg-[#f6faf6]',
}

function Columna({ estado, nombrePortafolio, onSoltar, onNuevo }: {
  estado: EstadoProyecto
  nombrePortafolio: (id?: string) => string
  onSoltar: (proyecto_id: string, estadoOrigen: string, destino: EstadoProyecto) => void
  onNuevo?: (estado: EstadoProyecto) => void
}) {
  const q = useProyectos({ estado }, 10)
  const [encima, setEncima] = useState(false)
  const items: Proyecto[] = q.data?.pages.flatMap((p) => p.items) ?? []

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setEncima(true) }}
      onDragLeave={() => setEncima(false)}
      onDrop={(e) => {
        e.preventDefault()
        setEncima(false)
        const id = e.dataTransfer.getData('proyecto_id')
        const origen = e.dataTransfer.getData('estado')
        if (id) onSoltar(id, origen, estado)
      }}
      className={`flex min-h-[22rem] flex-col rounded-lg p-2 transition ${FONDO_COLUMNA[estado]} ${
        encima ? 'ring-2 ring-azul/40' : ''
      }`}
    >
      <div className="mb-2 flex h-7 items-center gap-2 px-1">
        <EstadoBadge estado={estado} />
        <span className="text-sm tabular-nums text-tenue">{items.length}{q.hasNextPage ? '+' : ''}</span>
      </div>
      {q.isLoading ? <Cargando /> : null}
      {q.error ? <ErrorMsg error={q.error} /> : null}
      <div className="flex flex-col gap-2">
        {items.map((p) => (
          <div
            key={p.proyecto_id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('proyecto_id', p.proyecto_id)
              e.dataTransfer.setData('estado', p.estado)
            }}
            className="sombra-tarjeta group cursor-grab rounded-md bg-white p-2.5 transition hover:bg-[#fbfbfa] active:cursor-grabbing"
          >
            <p className="flex items-start gap-1.5 text-sm font-medium leading-snug">
              <Icono n="pagina" className="mt-0.5 h-4 w-4 text-tenue" />
              <Link to={`/proyectos/${p.proyecto_id}`} draggable={false} className="min-w-0 flex-1 hover:underline">{p.nombre}</Link>
              <Icono n="arrastrar" className="mt-0.5 h-4 w-4 text-tenue opacity-0 transition group-hover:opacity-100" />
              <AccionesProyecto id={p.proyecto_id} nombre={p.nombre} />
            </p>
            <p className="mb-2 mt-1 truncate text-xs text-suave">{nombrePortafolio(p.portafolio_id)}</p>
            <div className="mb-2 flex flex-wrap gap-1">
              <PrioridadBadge prioridad={p.prioridad} />
              {p.estado_presupuesto === 'EXCEDIDO' ? <ExcedidoBadge /> : null}
            </div>
            <Avance pct={p.avance_pct} />
            {p.fecha_fin ? (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-tenue">
                <Icono n="calendario" className="h-3 w-3" /> {fecha(p.fecha_fin)}
              </p>
            ) : null}
          </div>
        ))}
      </div>
      {q.hasNextPage ? (
        <button
          onClick={() => q.fetchNextPage()}
          disabled={q.isFetchingNextPage}
          className="mt-2 h-8 rounded-md px-2 text-left text-sm text-suave transition hover:bg-hover disabled:opacity-50"
        >
          {q.isFetchingNextPage ? 'Cargando…' : 'Cargar más'}
        </button>
      ) : null}
      {onNuevo ? (
        <button
          onClick={() => onNuevo(estado)}
          className="mt-1 flex h-8 items-center gap-1.5 rounded-md px-2 text-sm text-tenue transition hover:bg-hover hover:text-suave"
        >
          <Icono n="mas" className="h-3.5 w-3.5" /> Nuevo
        </button>
      ) : null}
    </div>
  )
}

export default function VistaKanban({ nombrePortafolio, onNuevo }: {
  nombrePortafolio: (id?: string) => string
  onNuevo?: (estado: EstadoProyecto) => void
}) {
  const qc = useQueryClient()
  const mover = useMutation({
    mutationFn: (v: { proyecto_id: string; estado: EstadoProyecto }) => put('proyectos', '/proyectos/modificar', v),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['proyectos'] })
      qc.invalidateQueries({ queryKey: ['resumen'] })
    },
  })

  return (
    <div className="pt-3">
      {mover.error ? <div className="mb-3"><ErrorMsg error={mover.error} /></div> : null}
      <div className="grid auto-cols-[minmax(260px,1fr)] grid-flow-col gap-3 overflow-x-auto pb-2">
        {ESTADOS.map((e) => (
          <Columna
            key={e}
            estado={e}
            nombrePortafolio={nombrePortafolio}
            onNuevo={onNuevo}
            onSoltar={(id, origen, destino) => {
              if (origen !== destino) mover.mutate({ proyecto_id: id, estado: destino })
            }}
          />
        ))}
      </div>
      <p className="mt-2 text-xs text-tenue">Arrastra una tarjeta a otra columna para cambiar su estado.</p>
    </div>
  )
}
