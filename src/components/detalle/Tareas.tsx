import { useState } from 'react'
import { useCrearTarea, useEliminarTarea, useModificarTarea, useTarea, useTareas } from '../../lib/servicios'
import { ESTADOS_TAREA, ETIQUETA_ESTADO_TAREA, PRIORIDADES, type Tarea } from '../../lib/tipos'
import { fecha } from '../../lib/formato'
import { BotonPrimario, Campo, Cargando, ErrorMsg, PrioridadBadge, entrada, entradaSutil } from '../ui'
import { Icono } from '../Iconos'
import { BarraSeccion, Estado, FilaNuevo, ModalConfirmar, ModalForm, PieLista, Tabla, aNumero, useModal } from '../comunes'

const etiquetaPrioridad = (p: string) => ({ BAJA: 'Baja', MEDIA: 'Media', ALTA: 'Alta' }[p] ?? p)

// Formulario de creación / edición (mismos campos que usa el backend)
function FormTarea({ proyecto_id, inicial, onCerrar }: { proyecto_id: string; inicial?: Tarea; onCerrar: () => void }) {
  const crear = useCrearTarea()
  const modificar = useModificarTarea()
  const eliminar = useEliminarTarea()
  const [confirmar, setConfirmar] = useState(false)
  const [f, setF] = useState({
    titulo: inicial?.titulo ?? '',
    descripcion: inicial?.descripcion ?? '',
    estado: inicial?.estado ?? 'PENDIENTE',
    prioridad: inicial?.prioridad ?? 'MEDIA',
    asignado_a: inicial?.asignado_a ?? '',
    fecha_limite: inicial?.fecha_limite ?? '',
    horas: inicial?.horas != null ? String(inicial.horas) : '',
  })
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }))
  const accion = inicial ? modificar : crear

  const guardar = () => {
    const datos = {
      titulo: f.titulo.trim(),
      descripcion: f.descripcion,
      estado: f.estado,
      prioridad: f.prioridad,
      asignado_a: f.asignado_a.trim(),
      fecha_limite: f.fecha_limite,
      horas: aNumero(f.horas),
    }
    const opciones = { onSuccess: onCerrar }
    if (inicial) modificar.mutate({ tarea_id: inicial.tarea_id, ...datos }, opciones)
    else crear.mutate({ proyecto_id, ...datos }, opciones)
  }

  if (confirmar && inicial)
    return (
      <ModalConfirmar
        titulo="Eliminar tarea"
        texto={`¿Eliminar la tarea “${inicial.titulo}”? Esta acción no se puede deshacer.`}
        cargando={eliminar.isPending}
        error={eliminar.error}
        onCerrar={() => setConfirmar(false)}
        onConfirmar={() => eliminar.mutate(inicial.tarea_id, { onSuccess: onCerrar })}
      />
    )

  return (
    <ModalForm
      titulo={inicial ? 'Tarea' : 'Nueva tarea'}
      onCerrar={onCerrar}
      onEnviar={guardar}
      cargando={accion.isPending}
      error={accion.error}
      deshabilitado={!f.titulo.trim()}
      etiqueta={inicial ? 'Guardar cambios' : 'Crear tarea'}
      izquierda={
        inicial ? (
          <button type="button" onClick={() => setConfirmar(true)} className="flex h-8 items-center gap-1.5 rounded-md px-2 text-sm text-[#c4554d] transition hover:bg-[#fdebec]">
            <Icono n="basura" /> Eliminar
          </button>
        ) : null
      }
    >
      <Campo etiqueta="Título">
        <input className={entrada} value={f.titulo} onChange={(e) => set('titulo', e.target.value)} placeholder="Qué hay que hacer" autoFocus />
      </Campo>
      <Campo etiqueta="Descripción">
        <textarea className={`${entrada} h-20 resize-none py-2`} value={f.descripcion} onChange={(e) => set('descripcion', e.target.value)} />
      </Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo etiqueta="Estado">
          <select className={entrada} value={f.estado} onChange={(e) => set('estado', e.target.value)}>
            {ESTADOS_TAREA.map((s) => <option key={s} value={s}>{ETIQUETA_ESTADO_TAREA[s]}</option>)}
          </select>
        </Campo>
        <Campo etiqueta="Prioridad">
          <select className={entrada} value={f.prioridad} onChange={(e) => set('prioridad', e.target.value)}>
            {PRIORIDADES.map((p) => <option key={p} value={p}>{etiquetaPrioridad(p)}</option>)}
          </select>
        </Campo>
        <Campo etiqueta="Asignado a">
          <input className={entrada} value={f.asignado_a} onChange={(e) => set('asignado_a', e.target.value)} placeholder="usuario" />
        </Campo>
        <Campo etiqueta="Fecha límite">
          <input type="date" className={entrada} value={f.fecha_limite} onChange={(e) => set('fecha_limite', e.target.value)} />
        </Campo>
        <Campo etiqueta="Horas estimadas">
          <input type="number" min="0" step="0.5" className={entrada} value={f.horas} onChange={(e) => set('horas', e.target.value)} />
        </Campo>
      </div>
    </ModalForm>
  )
}

// Abre la tarea consultándola al backend (endpoint buscar) antes de editarla
function EditarTarea({ tarea_id, proyecto_id, onCerrar }: { tarea_id: string; proyecto_id: string; onCerrar: () => void }) {
  const q = useTarea(tarea_id)
  if (q.isLoading || q.error || !q.data)
    return (
      <ModalForm titulo="Tarea" onCerrar={onCerrar} onEnviar={onCerrar} etiqueta="Cerrar" error={q.error}>
        {q.isLoading ? <Cargando /> : null}
      </ModalForm>
    )
  return <FormTarea proyecto_id={proyecto_id} inicial={q.data} onCerrar={onCerrar} />
}

export default function Tareas({ proyecto_id }: { proyecto_id: string }) {
  const q = useTareas(proyecto_id)
  const modificar = useModificarTarea()
  const nueva = useModal()
  const editar = useModal<string>()
  const filas = q.data?.pages.flatMap((p) => p.items) ?? []

  return (
    <div>
      <BarraSeccion titulo="Tareas del proyecto">
        <BotonPrimario onClick={() => nueva.abrir()}><Icono n="mas" className="h-3.5 w-3.5" /> Nueva tarea</BotonPrimario>
      </BarraSeccion>
      {modificar.error ? <div className="mb-2"><ErrorMsg error={modificar.error} /></div> : null}
      <Estado q={q}>
        <Tabla
          columnas={[['Título', 'texto', 'min-w-[220px]'], ['Estado', 'estado', 'min-w-[140px]'], ['Prioridad', 'bandera', 'min-w-[100px]'],
            ['Asignado a', 'usuario', 'min-w-[120px]'], ['Fecha límite', 'calendario', 'min-w-[120px]'], ['Horas', 'progreso', 'min-w-[70px]']]}
          vacio="Este proyecto aún no tiene tareas."
          filas={filas.map((t) => ({
            key: t.tarea_id,
            onClick: () => editar.abrir(t.tarea_id),
            celdas: [
              <span className="flex items-center gap-2 font-medium" title={t.tarea_id}><Icono n="check" className="h-4 w-4 text-tenue" /><span className="truncate">{t.titulo}</span></span>,
              // Cambiar el estado desde la tabla llama a modificar (y el backend actualiza el avance del proyecto)
              <span onClick={(e) => e.stopPropagation()}>
                <select
                  aria-label="Cambiar estado"
                  className={entradaSutil}
                  value={t.estado}
                  disabled={modificar.isPending}
                  onChange={(e) => modificar.mutate({ tarea_id: t.tarea_id, estado: e.target.value })}
                >
                  {ESTADOS_TAREA.map((s) => <option key={s} value={s}>{ETIQUETA_ESTADO_TAREA[s]}</option>)}
                </select>
              </span>,
              <PrioridadBadge prioridad={t.prioridad} />,
              <span className="text-suave">{t.asignado_a ?? '—'}</span>,
              <span className="text-suave">{fecha(t.fecha_limite)}</span>,
              <span className="text-suave">{t.horas ?? '—'}</span>,
            ],
          }))}
          pie={
            <>
              <FilaNuevo texto="Nueva tarea" onClick={() => nueva.abrir()} />
              <PieLista cantidad={filas.length} hayMas={q.hasNextPage} cargando={q.isFetchingNextPage} onMas={() => q.fetchNextPage()} />
            </>
          }
        />
      </Estado>
      {nueva.valor ? <FormTarea proyecto_id={proyecto_id} onCerrar={nueva.cerrar} /> : null}
      {editar.valor ? <EditarTarea tarea_id={editar.valor} proyecto_id={proyecto_id} onCerrar={editar.cerrar} /> : null}
    </div>
  )
}
