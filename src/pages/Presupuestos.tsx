import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCargarTodo, useProyectos } from '../lib/hooks'
import { usePresupuestos } from '../lib/servicios'
import { Callout, Encabezado, Etiqueta, ExcedidoBadge } from '../components/ui'
import { Icono } from '../components/Iconos'
import { Cifra, Estado, PieLista, Tabla, numero } from '../components/comunes'

const filtroCss = (activo: boolean) =>
  `h-7 max-w-52 cursor-pointer appearance-none rounded-full border pl-3 pr-7 text-sm outline-none transition ${
    activo ? 'border-azul/30 bg-azul/10 text-azul' : 'border-linea bg-transparent text-suave hover:bg-hover'
  }`

// Vista global de los presupuestos de todos los proyectos. Crear presupuestos y registrar gastos se hace dentro del proyecto.
export default function Presupuestos() {
  const navegar = useNavigate()
  const [estado, setEstado] = useState('')
  const q = usePresupuestos()
  useCargarTodo(q)
  const proyectos = useProyectos({}, 100)
  useCargarTodo(proyectos)
  const nombre = (id: string) => proyectos.data?.pages.flatMap((p) => p.items).find((x) => x.proyecto_id === id)?.nombre ?? id

  const todos = q.data?.pages.flatMap((p) => p.items) ?? []
  const filas = estado ? todos.filter((p) => p.estado_presupuesto === estado) : todos
  const monto = todos.reduce((s, p) => s + p.monto_total, 0)
  const gasto = todos.reduce((s, p) => s + p.gasto_acumulado, 0)
  const excedidos = todos.filter((p) => p.estado_presupuesto === 'EXCEDIDO').length

  return (
    <div>
      <Encabezado icono="💰" titulo="Presupuestos" descripcion="Monto, gasto y costo proyectado de cada proyecto." />
      <Callout icono="💡">
        El <b>gasto acumulado</b> suma los gastos que se registran en el proyecto. Cuando supera el monto total, el presupuesto pasa a <b>Excedido</b> y se envía un aviso por correo.
        El <b>costo proyectado</b> suma el costo de los recursos asignados al proyecto y sirve como referencia: no cambia el estado.
        Para crear un presupuesto o registrar gastos, entra al proyecto (pestaña Presupuesto).
      </Callout>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <Cifra etiqueta="Presupuestos" valor={todos.length} />
        <Cifra etiqueta="Monto total" valor={numero(monto)} />
        <Cifra etiqueta="Gasto acumulado" valor={numero(gasto)} pie={monto > 0 ? `${Math.round((100 * gasto) / monto)}% del monto total` : undefined} />
        <Cifra etiqueta="Excedidos" valor={excedidos} />
      </div>

      <div className="mt-3 flex items-center gap-2 border-b border-linea py-2">
        <span className="relative">
          <select aria-label="Filtrar por estado del presupuesto" className={filtroCss(!!estado)} value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="">Estado</option>
            <option value="NORMAL">Normal</option>
            <option value="EXCEDIDO">Excedido</option>
          </select>
          <Icono n="abajo" className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-tenue" />
        </span>
        {estado ? <button onClick={() => setEstado('')} className="h-7 rounded-md px-2 text-sm text-tenue transition hover:bg-hover hover:text-texto">Limpiar</button> : null}
      </div>

      <Estado q={q}>
        <Tabla
          columnas={[['Proyecto', 'proyectos', 'min-w-[240px]'], ['Monto total', 'moneda', 'min-w-[120px]'], ['Gasto acumulado', 'moneda', 'min-w-[170px]'],
            ['Costo proyectado', 'moneda', 'min-w-[130px]'], ['Estado', 'estado', 'min-w-[110px]']]}
          vacio="No hay presupuestos que coincidan."
          filas={filas.map((p) => {
            const pct = p.monto_total > 0 ? Math.round((100 * p.gasto_acumulado) / p.monto_total) : 0
            return {
              key: p.proyecto_id,
              onClick: () => navegar(`/proyectos/${p.proyecto_id}?tab=presupuesto`),
              celdas: [
                <span className="flex items-center gap-2 font-medium"><Icono n="pagina" className="h-4 w-4 text-tenue" /><span className="truncate">{nombre(p.proyecto_id)}</span></span>,
                <span className="tabular-nums">{numero(p.monto_total)}</span>,
                <span className="tabular-nums">{numero(p.gasto_acumulado)} <span className="text-tenue">({pct}%)</span></span>,
                <span className="tabular-nums text-suave">{numero(p.costo_proyectado)}</span>,
                p.estado_presupuesto === 'EXCEDIDO' ? <ExcedidoBadge /> : <Etiqueta color="verde" punto>Normal</Etiqueta>,
              ],
            }
          })}
          pie={<PieLista cantidad={filas.length} hayMas={q.hasNextPage} cargando={q.isFetchingNextPage} onMas={() => q.fetchNextPage()} />}
        />
      </Estado>
    </div>
  )
}
