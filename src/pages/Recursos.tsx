import { useState } from 'react'
import { useAsignaciones, useCrearRecurso, useEliminarAsignacion, useEliminarRecurso, useModificarRecurso, useRecurso, useRecursos } from '../lib/servicios'
import { useCargarTodo, useProyectos } from '../lib/hooks'
import { BotonPrimario, Cargando, Campo, Encabezado, ErrorMsg, entrada } from '../components/ui'
import { Icono } from '../components/Iconos'
import { Estado, FilaNuevo, ModalConfirmar, ModalForm, PieLista, Tabla, aNumero, numero, useModal } from '../components/comunes'
import type { Recurso } from '../lib/tipos'

function FormRecurso({ inicial, roles, onCerrar }: { inicial?: Recurso; roles: string[]; onCerrar: () => void }) {
  const crear = useCrearRecurso()
  const modificar = useModificarRecurso()
  const eliminar = useEliminarRecurso()
  const asignaciones = useAsignaciones(inicial ? { recurso_id: inicial.recurso_id } : {}, !!inicial)
  const [confirmar, setConfirmar] = useState(false)
  const [f, setF] = useState({
    nombre: inicial?.nombre ?? '',
    rol: inicial?.rol ?? '',
    costo_hora: inicial ? String(inicial.costo_hora) : '',
    capacidad_semanal: inicial?.capacidad_semanal != null ? String(inicial.capacidad_semanal) : '',
  })
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }))
  const accion = inicial ? modificar : crear
  const lista = asignaciones.data?.pages.flatMap((p) => p.items) ?? []
  const nAsignaciones = lista.length
  const quitar = useEliminarAsignacion()
  const proyectos = useProyectos({}, 100)
  const todosProyectos = proyectos.data?.pages.flatMap((p) => p.items)
  const nombreProyecto = (id: string) => (todosProyectos ? (todosProyectos.find((x) => x.proyecto_id === id)?.nombre ?? 'Proyecto eliminado') : id)

  if (confirmar && inicial)
    return (
      <ModalConfirmar
        titulo="Eliminar recurso"
        texto={`¿Eliminar el recurso “${inicial.nombre}”? Si tiene asignaciones, primero quítalas desde la ventana del recurso.`}
        cargando={eliminar.isPending}
        error={eliminar.error}
        onCerrar={() => setConfirmar(false)}
        onConfirmar={() => eliminar.mutate(inicial.recurso_id, { onSuccess: onCerrar })}
      />
    )

  return (
    <ModalForm
      titulo={inicial ? 'Recurso' : 'Nuevo recurso'}
      onCerrar={onCerrar}
      cargando={accion.isPending}
      error={accion.error}
      deshabilitado={!f.nombre.trim() || !(Number(f.costo_hora) > 0)}
      etiqueta={inicial ? 'Guardar cambios' : 'Crear recurso'}
      onEnviar={() => {
        const datos = { nombre: f.nombre.trim(), rol: f.rol.trim(), costo_hora: Number(f.costo_hora), capacidad_semanal: aNumero(f.capacidad_semanal) }
        if (inicial) modificar.mutate({ recurso_id: inicial.recurso_id, ...datos }, { onSuccess: onCerrar })
        else crear.mutate(datos, { onSuccess: onCerrar })
      }}
      izquierda={
        inicial ? (
          <button type="button" onClick={() => setConfirmar(true)} className="flex h-8 items-center gap-1.5 rounded-md px-2 text-sm text-[#c4554d] transition hover:bg-[#fdebec]">
            <Icono n="basura" /> Eliminar
          </button>
        ) : null
      }
    >
      {inicial ? <p className="mb-2 text-sm text-suave">Asignado en <span className="font-medium text-texto">{nAsignaciones}</span> {nAsignaciones === 1 ? 'proyecto' : 'proyectos'}.</p> : null}
      {inicial && nAsignaciones > 0 ? (
        <div className="mb-4">
          <p className="mb-1 text-xs text-tenue">Para eliminar el recurso, quita primero sus asignaciones.</p>
          {lista.map((a) => (
            <div key={a.asignacion_id} className="flex items-center gap-2 border-b border-linea py-1.5 text-sm">
              <span className="min-w-0 flex-1 truncate">{nombreProyecto(a.proyecto_id)}</span>
              <span className="tabular-nums text-suave">{a.horas} h</span>
              <button
                type="button"
                disabled={quitar.isPending}
                onClick={() => quitar.mutate(a.asignacion_id)}
                className="rounded-md px-2 py-1 text-xs text-[#c4554d] transition hover:bg-[#fdebec] disabled:opacity-50"
              >
                Quitar
              </button>
            </div>
          ))}
          {quitar.error ? <div className="pt-2"><ErrorMsg error={quitar.error} /></div> : null}
        </div>
      ) : null}
      <Campo etiqueta="Nombre"><input className={entrada} value={f.nombre} onChange={(e) => set('nombre', e.target.value)} placeholder="Nombre de la persona o equipo" autoFocus /></Campo>
      <Campo etiqueta="Rol"><input className={entrada} list="roles-existentes" value={f.rol} onChange={(e) => set('rol', e.target.value)} placeholder="Desarrollador, Diseñador…" /><datalist id="roles-existentes">{roles.map((r) => <option key={r} value={r} />)}</datalist></Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo etiqueta="Costo por hora"><input type="number" min="0" step="0.01" className={entrada} value={f.costo_hora} onChange={(e) => set('costo_hora', e.target.value)} /></Campo>
        <Campo etiqueta="Capacidad semanal (horas)"><input type="number" min="0" step="1" className={entrada} value={f.capacidad_semanal} onChange={(e) => set('capacidad_semanal', e.target.value)} /></Campo>
      </div>
    </ModalForm>
  )
}

// Abre el recurso consultándolo al backend (endpoint buscar)
function EditarRecurso({ recurso_id, roles, onCerrar }: { recurso_id: string; roles: string[]; onCerrar: () => void }) {
  const q = useRecurso(recurso_id)
  if (!q.data)
    return (
      <ModalForm titulo="Recurso" onCerrar={onCerrar} onEnviar={onCerrar} etiqueta="Cerrar" error={q.error}>
        {q.isLoading ? <Cargando /> : null}
      </ModalForm>
    )
  return <FormRecurso inicial={q.data} roles={roles} onCerrar={onCerrar} />
}

export default function Recursos() {
  const [rol, setRol] = useState('')
  const q = useRecursos()
  // Se cargan todos los recursos para armar el desplegable con los roles que de verdad existen
  useCargarTodo(q)
  const nuevo = useModal()
  const editar = useModal<string>()
  const todos = q.data?.pages.flatMap((p) => p.items) ?? []
  const roles = [...new Set(todos.map((r) => r.rol).filter((r): r is string => !!r))].sort((a, b) => a.localeCompare(b))
  const filas = rol ? todos.filter((r) => r.rol === rol) : todos

  return (
    <div>
      <Encabezado
        icono="👥"
        titulo="Recursos"
        descripcion="Personas y equipos que puedes asignar a los proyectos."
        acciones={<BotonPrimario onClick={() => nuevo.abrir()}><Icono n="mas" className="h-3.5 w-3.5" /> Nuevo recurso</BotonPrimario>}
      />
      <div className="flex items-center gap-2 border-b border-linea py-2">
        <select
          aria-label="Filtrar por rol"
          className={`h-7 max-w-56 cursor-pointer rounded-full border px-3 text-sm outline-none transition ${rol ? 'border-azul/30 bg-azul/10 text-azul' : 'border-linea bg-transparent text-suave hover:bg-hover'}`}
          value={rol}
          onChange={(e) => setRol(e.target.value)}
        >
          <option value="">Todos los roles</option>
          {roles.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        {rol ? <button type="button" onClick={() => setRol('')} className="h-7 rounded-md px-2 text-sm text-tenue transition hover:bg-hover hover:text-texto">Limpiar</button> : null}
      </div>
      <Estado q={q}>
        <Tabla
          columnas={[['Nombre', 'usuario', 'min-w-[220px]'], ['Rol', 'texto', 'min-w-[160px]'], ['Costo por hora', 'moneda', 'min-w-[130px]'], ['Capacidad semanal', 'progreso', 'min-w-[150px]']]}
          vacio="No hay recursos que coincidan."
          filas={filas.map((r) => ({
            key: r.recurso_id,
            onClick: () => editar.abrir(r.recurso_id),
            celdas: [
              <span className="flex items-center gap-2 font-medium" title={r.recurso_id}><Icono n="usuario" className="h-4 w-4 text-tenue" />{r.nombre}</span>,
              <span className="text-suave">{r.rol || '—'}</span>,
              <span className="tabular-nums">{numero(r.costo_hora)}</span>,
              <span className="tabular-nums text-suave">{r.capacidad_semanal != null ? `${r.capacidad_semanal} h` : '—'}</span>,
            ],
          }))}
          pie={
            <>
              <FilaNuevo texto="Nuevo recurso" onClick={() => nuevo.abrir()} />
              <PieLista cantidad={filas.length} hayMas={q.hasNextPage} cargando={q.isFetchingNextPage} onMas={() => q.fetchNextPage()} />
            </>
          }
        />
      </Estado>
      {nuevo.valor ? <FormRecurso roles={roles} onCerrar={nuevo.cerrar} /> : null}
      {editar.valor ? <EditarRecurso recurso_id={editar.valor} roles={roles} onCerrar={editar.cerrar} /> : null}
    </div>
  )
}
