import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCargarTodo, useProyectos } from '../lib/hooks'
import { useTodasTareas } from '../lib/servicios'
import { coincide, fecha } from '../lib/formato'
import { ESTADOS_TAREA, ETIQUETA_ESTADO_TAREA, type EstadoTarea } from '../lib/tipos'
import { Callout, Encabezado, Etiqueta, PrioridadBadge, type ColorEtiqueta } from '../components/ui'
import { Icono } from '../components/Iconos'
import { Cifra, Estado, PieLista, Tabla } from '../components/comunes'

const COLOR_TAREA: Record<EstadoTarea, ColorEtiqueta> = { PENDIENTE: 'gris', EN_CURSO: 'azul', COMPLETADA: 'verde' }

const filtroCss = (activo: boolean) =>
  `h-7 max-w-52 cursor-pointer appearance-none rounded-full border pl-3 pr-7 text-sm outline-none transition ${
    activo ? 'border-azul/30 bg-azul/10 text-azul' : 'border-linea bg-transparent text-suave hover:bg-hover'
  }`

// Vista global de las tareas de todos los proyectos. Crear y editar tareas se hace dentro de cada proyecto.
export default function Tareas() {
  const navegar = useNavigate()
  const [estado, setEstado] = useState('')
  const [proyecto, setProyecto] = useState('')
  const [texto, setTexto] = useState('')
  const q = useTodasTareas({ ...(estado ? { estado } : {}), ...(proyecto ? { proyecto_id: proyecto } : {}) })
  useCargarTodo(q)
  const proyectos = useProyectos({}, 100)
  useCargarTodo(proyectos)
  const listaProyectos = proyectos.data?.pages.flatMap((p) => p.items) ?? []
  const nombre = (id: string) => listaProyectos.find((p) => p.proyecto_id === id)?.nombre ?? id

  const todas = q.data?.pages.flatMap((p) => p.items) ?? []
  const filas = todas
    .filter((t) => coincide(t.titulo, texto))
    // Las más próximas a vencer primero; sin fecha al final
    .sort((a, b) => (a.fecha_limite ?? '9999').localeCompare(b.fecha_limite ?? '9999'))
  const completadas = todas.filter((t) => t.estado === 'COMPLETADA').length

  return (
    <div>
      <Encabezado icono="📋" titulo="Tareas" descripcion="Las tareas de todos los proyectos de tu organización." />
      <Callout icono="💡">Aquí ves y filtras todas las tareas. Para crear o editar una, entra al proyecto (pestaña Tareas) haciendo clic en su fila.</Callout>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Cifra etiqueta="Tareas" valor={todas.length} pie={estado || proyecto ? 'Según el filtro elegido' : 'En todos los proyectos'} />
        <Cifra etiqueta="Completadas" valor={completadas} />
        <Cifra etiqueta="Pendientes o en curso" valor={todas.length - completadas} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-b border-linea py-2">
        <input
          aria-label="Buscar tarea por título"
          className="h-7 w-48 rounded-full border border-linea bg-transparent px-3 text-sm outline-none transition placeholder:text-tenue focus:border-azul/40"
          placeholder="Buscar por título…"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <span className="relative">
          <select aria-label="Filtrar por estado" className={filtroCss(!!estado)} value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="">Estado</option>
            {ESTADOS_TAREA.map((s) => <option key={s} value={s}>{ETIQUETA_ESTADO_TAREA[s]}</option>)}
          </select>
          <Icono n="abajo" className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-tenue" />
        </span>
        <span className="relative">
          <select aria-label="Filtrar por proyecto" className={filtroCss(!!proyecto)} value={proyecto} onChange={(e) => setProyecto(e.target.value)}>
            <option value="">Proyecto</option>
            {listaProyectos.map((p) => <option key={p.proyecto_id} value={p.proyecto_id}>{p.nombre}</option>)}
          </select>
          <Icono n="abajo" className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-tenue" />
        </span>
        {estado || proyecto || texto ? (
          <button onClick={() => { setEstado(''); setProyecto(''); setTexto('') }} className="h-7 rounded-md px-2 text-sm text-tenue transition hover:bg-hover hover:text-texto">Limpiar</button>
        ) : null}
      </div>

      <Estado q={q}>
        <Tabla
          columnas={[['Título', 'texto', 'min-w-[240px]'], ['Proyecto', 'proyectos', 'min-w-[200px]'], ['Estado', 'estado', 'min-w-[130px]'],
            ['Prioridad', 'bandera', 'min-w-[100px]'], ['Asignado a', 'usuario', 'min-w-[120px]'], ['Fecha límite', 'calendario', 'min-w-[120px]']]}
          vacio="No hay tareas que coincidan."
          filas={filas.map((t) => ({
            key: t.tarea_id,
            onClick: () => navegar(`/proyectos/${t.proyecto_id}`),
            celdas: [
              <span className="flex items-center gap-2 font-medium" title={t.tarea_id}><Icono n="check" className="h-4 w-4 text-tenue" /><span className="truncate">{t.titulo}</span></span>,
              <span className="text-suave">{nombre(t.proyecto_id)}</span>,
              <Etiqueta color={COLOR_TAREA[t.estado]} punto>{ETIQUETA_ESTADO_TAREA[t.estado]}</Etiqueta>,
              <PrioridadBadge prioridad={t.prioridad} />,
              <span className="text-suave">{t.asignado_a ?? '—'}</span>,
              <span className="text-suave">{fecha(t.fecha_limite)}</span>,
            ],
          }))}
          pie={<PieLista cantidad={filas.length} hayMas={q.hasNextPage} cargando={q.isFetchingNextPage} onMas={() => q.fetchNextPage()} />}
        />
      </Estado>
    </div>
  )
}
