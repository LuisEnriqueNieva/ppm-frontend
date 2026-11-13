import { useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { usePortafolios } from '../lib/hooks'
import { useEliminarProyecto, useModificarProyecto, useProyecto } from '../lib/servicios'
import { ESTADOS, ETIQUETA_ESTADO } from '../lib/tipos'
import { Campo, Cargando, entrada } from './ui'
import { BotonIcono, ModalConfirmar, ModalForm, useModal } from './comunes'

// Editar / eliminar un proyecto: se usa en la lista, el kanban y el detalle.
export function EditarProyecto({ id, onCerrar }: { id: string; onCerrar: () => void }) {
  const q = useProyecto(id)
  const { data: portafolios = [] } = usePortafolios()
  const modificar = useModificarProyecto()
  const p = q.data
  const [f, setF] = useState<{ nombre: string; descripcion: string; estado: string; portafolio_id: string; fecha_fin: string } | null>(null)
  const datos = f ?? (p ? { nombre: p.nombre, descripcion: p.descripcion ?? '', estado: p.estado, portafolio_id: p.portafolio_id ?? '', fecha_fin: p.fecha_fin ?? '' } : null)
  if (!datos) return <ModalForm titulo="Editar proyecto" onCerrar={onCerrar} onEnviar={onCerrar} etiqueta="Cerrar" error={q.error}><Cargando /></ModalForm>
  const set = (k: string, v: string) => setF({ ...datos, [k]: v })
  return (
    <ModalForm
      titulo="Editar proyecto"
      onCerrar={onCerrar}
      cargando={modificar.isPending}
      error={modificar.error}
      deshabilitado={!datos.nombre.trim()}
      onEnviar={() =>
        modificar.mutate(
          { proyecto_id: id, nombre: datos.nombre.trim(), descripcion: datos.descripcion, estado: datos.estado, portafolio_id: datos.portafolio_id, fecha_fin: datos.fecha_fin },
          { onSuccess: onCerrar },
        )
      }
    >
      <Campo etiqueta="Nombre"><input className={entrada} value={datos.nombre} onChange={(e) => set('nombre', e.target.value)} autoFocus /></Campo>
      <Campo etiqueta="Descripción"><textarea className={`${entrada} h-20 resize-none py-2`} value={datos.descripcion} onChange={(e) => set('descripcion', e.target.value)} /></Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo etiqueta="Estado">
          <select className={entrada} value={datos.estado} onChange={(e) => set('estado', e.target.value)}>
            {ESTADOS.map((s) => <option key={s} value={s}>{ETIQUETA_ESTADO[s]}</option>)}
          </select>
        </Campo>
        <Campo etiqueta="Fecha fin"><input type="date" className={entrada} value={datos.fecha_fin} onChange={(e) => set('fecha_fin', e.target.value)} /></Campo>
      </div>
      <Campo etiqueta="Portafolio">
        <select className={entrada} value={datos.portafolio_id} onChange={(e) => set('portafolio_id', e.target.value)}>
          <option value="">Sin portafolio</option>
          {portafolios.map((p) => <option key={p.portafolio_id} value={p.portafolio_id}>{p.nombre}</option>)}
        </select>
      </Campo>
    </ModalForm>
  )
}

// Dos botones de ícono (editar y eliminar) con sus ventanas, para cada fila o tarjeta.
export function AccionesProyecto({ id, nombre }: { id: string; nombre: string }) {
  const editar = useModal()
  const borrar = useModal()
  const eliminar = useEliminarProyecto()
  const enBody = (n: ReactNode) => createPortal(n, document.body)
  return (
    <>
      <span className="flex shrink-0 items-center opacity-0 transition focus-within:opacity-100 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
        <BotonIcono icono="editar" titulo="Editar proyecto" onClick={() => editar.abrir()} />
        <BotonIcono icono="basura" titulo="Eliminar proyecto" onClick={() => borrar.abrir()} />
      </span>
      {editar.valor ? enBody(<EditarProyecto id={id} onCerrar={editar.cerrar} />) : null}
      {borrar.valor
        ? enBody(
            <ModalConfirmar
              titulo="Eliminar proyecto"
              texto={`¿Eliminar el proyecto “${nombre}”? Esta acción no se puede deshacer.`}
              cargando={eliminar.isPending}
              error={eliminar.error}
              onCerrar={borrar.cerrar}
              onConfirmar={() => eliminar.mutate(id, { onSuccess: borrar.cerrar })}
            />,
          )
        : null}
    </>
  )
}
