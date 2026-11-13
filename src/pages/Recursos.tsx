import { useState } from 'react'
import { useAsignaciones, useCrearRecurso, useEliminarRecurso, useModificarRecurso, useRecurso, useRecursos } from '../lib/servicios'
import { BotonPrimario, Cargando, Campo, Encabezado, entrada } from '../components/ui'
import { Icono } from '../components/Iconos'
import { Estado, FilaNuevo, ModalConfirmar, ModalForm, PieLista, Tabla, aNumero, numero, useModal } from '../components/comunes'
import type { Recurso } from '../lib/tipos'

function FormRecurso({ inicial, onCerrar }: { inicial?: Recurso; onCerrar: () => void }) {
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
  const nAsignaciones = asignaciones.data?.pages.flatMap((p) => p.items).length ?? 0

  if (confirmar && inicial)
    return (
      <ModalConfirmar
        titulo="Eliminar recurso"
        texto={`¿Eliminar el recurso “${inicial.nombre}”? Si tiene asignaciones, el sistema no lo permitirá.`}
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
      {inicial ? <p className="mb-4 text-sm text-suave">Asignado en <span className="font-medium text-texto">{nAsignaciones}</span> {nAsignaciones === 1 ? 'proyecto' : 'proyectos'}.</p> : null}
      <Campo etiqueta="Nombre"><input className={entrada} value={f.nombre} onChange={(e) => set('nombre', e.target.value)} placeholder="Nombre de la persona o equipo" autoFocus /></Campo>
      <Campo etiqueta="Rol"><input className={entrada} value={f.rol} onChange={(e) => set('rol', e.target.value)} placeholder="Desarrollador, Diseñador…" /></Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo etiqueta="Costo por hora"><input type="number" min="0" step="0.01" className={entrada} value={f.costo_hora} onChange={(e) => set('costo_hora', e.target.value)} /></Campo>
        <Campo etiqueta="Capacidad semanal (horas)"><input type="number" min="0" step="1" className={entrada} value={f.capacidad_semanal} onChange={(e) => set('capacidad_semanal', e.target.value)} /></Campo>
      </div>
    </ModalForm>
  )
}

// Abre el recurso consultándolo al backend (endpoint buscar)
function EditarRecurso({ recurso_id, onCerrar }: { recurso_id: string; onCerrar: () => void }) {
  const q = useRecurso(recurso_id)
  if (!q.data)
    return (
      <ModalForm titulo="Recurso" onCerrar={onCerrar} onEnviar={onCerrar} etiqueta="Cerrar" error={q.error}>
        {q.isLoading ? <Cargando /> : null}
      </ModalForm>
    )
  return <FormRecurso inicial={q.data} onCerrar={onCerrar} />
}

export default function Recursos() {
  const [rol, setRol] = useState('')
  const [filtro, setFiltro] = useState('')
  const q = useRecursos(filtro || undefined)
  const nuevo = useModal()
  const editar = useModal<string>()
  const filas = q.data?.pages.flatMap((p) => p.items) ?? []

  return (
    <div>
      <Encabezado
        icono="👥"
        titulo="Recursos"
        descripcion="Personas y equipos que puedes asignar a los proyectos."
        acciones={<BotonPrimario onClick={() => nuevo.abrir()}><Icono n="mas" className="h-3.5 w-3.5" /> Nuevo recurso</BotonPrimario>}
      />
      <form
        className="flex items-center gap-2 border-b border-linea py-2"
        onSubmit={(e) => { e.preventDefault(); setFiltro(rol.trim()) }}
      >
        <input
          aria-label="Filtrar por rol"
          className="h-7 w-52 rounded-full border border-linea bg-transparent px-3 text-sm outline-none transition placeholder:text-tenue focus:border-azul/40"
          placeholder="Filtrar por rol (exacto)"
          value={rol}
          onChange={(e) => setRol(e.target.value)}
        />
        {filtro ? <button type="button" onClick={() => { setRol(''); setFiltro('') }} className="h-7 rounded-md px-2 text-sm text-tenue transition hover:bg-hover hover:text-texto">Limpiar</button> : null}
      </form>
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
      {nuevo.valor ? <FormRecurso onCerrar={nuevo.cerrar} /> : null}
      {editar.valor ? <EditarRecurso recurso_id={editar.valor} onCerrar={editar.cerrar} /> : null}
    </div>
  )
}
