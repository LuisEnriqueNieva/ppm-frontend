import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { usePortafolios } from '../lib/hooks'
import { useEliminarProyecto, useProyecto } from '../lib/servicios'
import { fecha } from '../lib/formato'
import { Avance, BotonSecundario, Cargando, Encabezado, ErrorMsg, EstadoBadge, ExcedidoBadge, Etiqueta, PrioridadBadge } from '../components/ui'
import { Icono } from '../components/Iconos'
import { ModalConfirmar, Pestanas, Propiedad, useModal } from '../components/comunes'
import { EditarProyecto } from '../components/AccionesProyecto'
import Tareas from '../components/detalle/Tareas'
import Presupuesto from '../components/detalle/Presupuesto'
import Asignaciones from '../components/detalle/Asignaciones'
import Adjuntos from '../components/detalle/Adjuntos'
import Prioridad from '../components/detalle/Prioridad'

type Pestana = 'tareas' | 'presupuesto' | 'recursos' | 'adjuntos' | 'prioridad'
const PESTANAS: { id: Pestana; nombre: string; icono: string }[] = [
  { id: 'tareas', nombre: 'Tareas', icono: 'check' },
  { id: 'presupuesto', nombre: 'Presupuesto', icono: 'moneda' },
  { id: 'recursos', nombre: 'Recursos', icono: 'usuario' },
  { id: 'adjuntos', nombre: 'Adjuntos', icono: 'clip' },
  { id: 'prioridad', nombre: 'Prioridad', icono: 'objetivo' },
]

export default function ProyectoDetalle() {
  const { id = '' } = useParams()
  const navegar = useNavigate()
  const q = useProyecto(id)
  const { data: portafolios = [] } = usePortafolios()
  const eliminar = useEliminarProyecto()
  const [params] = useSearchParams()
  const [pestana, setPestana] = useState<Pestana>(PESTANAS.find((x) => x.id === params.get('tab'))?.id ?? 'tareas')
  const editar = useModal()
  const borrar = useModal()
  const p = q.data

  if (q.isLoading) return <div className="pt-14"><Cargando /></div>
  if (q.error || !p)
    return (
      <div className="pt-14">
        <ErrorMsg error={q.error ?? new Error('No se encontró el proyecto')} />
        <Link to="/proyectos" className="mt-3 inline-block text-sm text-azul hover:underline">← Volver a Proyectos</Link>
      </div>
    )
  const portafolio = portafolios.find((x) => x.portafolio_id === p.portafolio_id)?.nombre ?? (p.portafolio_id ? p.portafolio_id : 'Sin portafolio')

  return (
    <div>
      <Encabezado
        icono="📄"
        titulo={p.nombre}
        descripcion={p.descripcion || undefined}
        acciones={
          <div className="flex items-center gap-2">
            <BotonSecundario onClick={() => editar.abrir()}><Icono n="editar" /> Editar</BotonSecundario>
            <BotonSecundario onClick={() => borrar.abrir()} className="!text-[#c4554d]"><Icono n="basura" /> Eliminar</BotonSecundario>
          </div>
        }
      />
      <Link to="/proyectos" className="-mt-3 mb-3 inline-block text-sm text-suave hover:text-texto">← Proyectos</Link>

      <div className="mb-4 space-y-0.5">
        <Propiedad icono="estado" etiqueta="Estado"><EstadoBadge estado={p.estado} /></Propiedad>
        <Propiedad icono="bandera" etiqueta="Prioridad"><PrioridadBadge prioridad={p.prioridad} /></Propiedad>
        <Propiedad icono="proyectos" etiqueta="Portafolio">{portafolio}</Propiedad>
        <Propiedad icono="progreso" etiqueta="Avance"><span className="flex items-center gap-3"><Avance pct={p.avance_pct} /><span className="text-tenue">{p.tareas_completadas} de {p.tareas_total} tareas</span></span></Propiedad>
        <Propiedad icono="moneda" etiqueta="Presupuesto">{p.estado_presupuesto === 'EXCEDIDO' ? <ExcedidoBadge /> : <Etiqueta color="verde" punto>Normal</Etiqueta>}</Propiedad>
        <Propiedad icono="calendario" etiqueta="Fecha fin">{fecha(p.fecha_fin)}</Propiedad>
      </div>

      <Pestanas items={PESTANAS} activa={pestana} onCambiar={setPestana} />
      <div className="pt-2">
        {pestana === 'tareas' ? <Tareas proyecto_id={id} /> : null}
        {pestana === 'presupuesto' ? <Presupuesto proyecto_id={id} /> : null}
        {pestana === 'recursos' ? <Asignaciones proyecto_id={id} /> : null}
        {pestana === 'adjuntos' ? <Adjuntos proyecto_id={id} /> : null}
        {pestana === 'prioridad' ? <Prioridad proyecto_id={id} /> : null}
      </div>

      {editar.valor ? <EditarProyecto id={id} onCerrar={editar.cerrar} /> : null}
      {borrar.valor ? (
        <ModalConfirmar
          titulo="Eliminar proyecto"
          texto={`¿Eliminar el proyecto “${p.nombre}”? Esta acción no se puede deshacer.`}
          cargando={eliminar.isPending}
          error={eliminar.error}
          onCerrar={borrar.cerrar}
          onConfirmar={() => eliminar.mutate(id, { onSuccess: () => navegar('/proyectos') })}
        />
      ) : null}
    </div>
  )
}
