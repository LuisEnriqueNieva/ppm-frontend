import { Link } from 'react-router-dom'
import { useProyectos, type FiltroProyectos } from '../lib/hooks'
import { fecha } from '../lib/formato'
import { Icono } from './Iconos'
import { AccionesProyecto } from './AccionesProyecto'
import { Avance, Cargando, ErrorMsg, EstadoBadge, ExcedidoBadge, PrioridadBadge } from './ui'

const COLUMNAS: [string, string, string][] = [
  ['Nombre', 'texto', 'min-w-[240px]'],
  ['Portafolio', 'proyectos', 'min-w-[150px]'],
  ['Estado', 'estado', 'min-w-[130px]'],
  ['Prioridad', 'bandera', 'min-w-[100px]'],
  ['Avance', 'progreso', 'min-w-[130px]'],
  ['Presupuesto', 'moneda', 'min-w-[120px]'],
  ['Fecha fin', 'calendario', 'min-w-[120px]'],
]

const celda = 'h-[37px] border-r border-linea px-2 last:border-r-0'

export default function VistaTabla({ filtro, nombrePortafolio, onNuevo }: {
  filtro: FiltroProyectos
  nombrePortafolio: (id?: string) => string
  onNuevo?: () => void
}) {
  const q = useProyectos(filtro, 20)
  if (q.isLoading) return <Cargando />
  if (q.error) return <div className="pt-3"><ErrorMsg error={q.error} /></div>
  const filas = q.data?.pages.flatMap((p) => p.items) ?? []

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse whitespace-nowrap text-left text-sm">
          <thead>
            <tr className="border-b border-linea">
              {COLUMNAS.map(([h, icono, ancho]) => (
                <th key={h} className={`${celda} ${ancho} font-normal text-suave`}>
                  <span className="flex items-center gap-1.5">
                    <Icono n={icono} className="h-3.5 w-3.5" /> {h}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((p) => (
              <tr key={p.proyecto_id} className="group border-b border-linea transition hover:bg-[#fbfbfa]">
                <td className={celda}>
                  <span className="flex items-center gap-2 font-medium" title={p.proyecto_id}>
                    <Icono n="pagina" className="h-4 w-4 text-tenue" />
                    <Link to={`/proyectos/${p.proyecto_id}`} className="min-w-0 flex-1 truncate hover:underline">{p.nombre}</Link>
                    <AccionesProyecto id={p.proyecto_id} nombre={p.nombre} />
                  </span>
                </td>
                <td className={`${celda} text-suave`}>{nombrePortafolio(p.portafolio_id)}</td>
                <td className={celda}><EstadoBadge estado={p.estado} /></td>
                <td className={celda}><PrioridadBadge prioridad={p.prioridad} /></td>
                <td className={celda}><Avance pct={p.avance_pct} /></td>
                <td className={celda}>
                  {p.estado_presupuesto === 'EXCEDIDO' ? <ExcedidoBadge /> : <span className="text-tenue">Normal</span>}
                </td>
                <td className={`${celda} text-suave`}>{fecha(p.fecha_fin)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filas.length === 0 ? (
        <p className="border-b border-linea py-10 text-center text-sm text-tenue">No hay proyectos que coincidan.</p>
      ) : null}

      {onNuevo ? (
        <button
          onClick={onNuevo}
          className="flex h-[34px] w-full items-center gap-1.5 border-b border-linea px-2 text-sm text-tenue transition hover:bg-hover"
        >
          <Icono n="mas" className="h-3.5 w-3.5" /> Nuevo proyecto
        </button>
      ) : null}

      <div className="flex h-9 items-center justify-between px-2 text-xs text-tenue">
        <span>
          <span className="uppercase tracking-wide">Cuenta</span>{' '}
          <span className="text-suave">{filas.length}</span>
        </span>
        {q.hasNextPage ? (
          <button
            onClick={() => q.fetchNextPage()}
            disabled={q.isFetchingNextPage}
            className="rounded-md px-2 py-1 text-sm text-suave transition hover:bg-hover hover:text-texto disabled:opacity-50"
          >
            {q.isFetchingNextPage ? 'Cargando…' : 'Cargar más'}
          </button>
        ) : null}
      </div>
    </div>
  )
}
