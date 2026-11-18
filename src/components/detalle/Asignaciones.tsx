import { useState } from 'react'
import { useAsignaciones, useCrearAsignacion, useEliminarAsignacion, useRecursos } from '../../lib/servicios'
import { BotonPrimario, Callout, Campo, ErrorMsg, entrada } from '../ui'
import { Icono } from '../Iconos'
import { BarraSeccion, Estado, FilaNuevo, ModalForm, PieLista, Tabla, numero, useModal } from '../comunes'

function ModalAsignar({ proyecto_id, onCerrar }: { proyecto_id: string; onCerrar: () => void }) {
  const recursos = useRecursos()
  const crear = useCrearAsignacion()
  const [recurso_id, setRecurso] = useState('')
  const [horas, setHoras] = useState('')
  const lista = recursos.data?.pages.flatMap((p) => p.items) ?? []
  const elegido = lista.find((r) => r.recurso_id === recurso_id)
  const costo = elegido && Number(horas) > 0 ? elegido.costo_hora * Number(horas) : null
  return (
    <ModalForm
      titulo="Asignar recurso"
      onCerrar={onCerrar}
      cargando={crear.isPending}
      error={crear.error ?? recursos.error}
      deshabilitado={!recurso_id || !(Number(horas) > 0)}
      etiqueta="Asignar"
      onEnviar={() => crear.mutate({ proyecto_id, recurso_id, horas: Number(horas) }, { onSuccess: onCerrar })}
    >
      <Campo etiqueta="Recurso">
        <select className={entrada} value={recurso_id} onChange={(e) => setRecurso(e.target.value)} autoFocus>
          <option value="">Elige un recurso</option>
          {lista.map((r) => <option key={r.recurso_id} value={r.recurso_id}>{r.nombre}{r.rol ? ` · ${r.rol}` : ''}</option>)}
        </select>
      </Campo>
      <Campo etiqueta="Horas">
        <input type="number" min="0" step="0.5" className={entrada} value={horas} onChange={(e) => setHoras(e.target.value)} placeholder="0" />
      </Campo>
      {costo != null ? <p className="mb-4 text-sm text-suave">Costo de la asignación: <span className="font-medium text-texto">{numero(costo)}</span> ({numero(elegido!.costo_hora)} por hora)</p> : null}
    </ModalForm>
  )
}

export default function Asignaciones({ proyecto_id }: { proyecto_id: string }) {
  const q = useAsignaciones({ proyecto_id })
  const recursos = useRecursos()
  const asignar = useModal()
  const quitar = useEliminarAsignacion()
  const filas = q.data?.pages.flatMap((p) => p.items) ?? []
  const nombre = (id: string) => recursos.data?.pages.flatMap((p) => p.items).find((r) => r.recurso_id === id)?.nombre ?? id
  const total = filas.reduce((s, a) => s + a.costo, 0)

  return (
    <div>
      <BarraSeccion titulo="Recursos asignados al proyecto">
        <BotonPrimario onClick={() => asignar.abrir()}><Icono n="mas" className="h-3.5 w-3.5" /> Asignar recurso</BotonPrimario>
      </BarraSeccion>
      <Callout icono="💡">Cada asignación suma su costo al <b>costo proyectado</b> del presupuesto, y al quitarla se descuenta (se actualiza por un evento, puede tardar unos segundos).</Callout>
      {quitar.error ? <div className="mt-3"><ErrorMsg error={quitar.error} /></div> : null}
      <div className="mt-3">
        <Estado q={q}>
          <Tabla
            columnas={[['Recurso', 'usuario', 'min-w-[200px]'], ['Horas', 'progreso', 'min-w-[90px]'], ['Costo por hora', 'moneda', 'min-w-[130px]'], ['Costo', 'moneda', 'min-w-[120px]'], ['', 'basura', 'w-24']]}
            vacio="Aún no hay recursos asignados a este proyecto."
            filas={filas.map((a) => ({
              key: a.asignacion_id,
              celdas: [<span className="font-medium">{nombre(a.recurso_id)}</span>, <span className="tabular-nums">{a.horas}</span>, <span className="tabular-nums text-suave">{numero(a.costo_hora)}</span>, <span className="tabular-nums">{numero(a.costo)}</span>,
                <button type="button" disabled={quitar.isPending} onClick={() => quitar.mutate(a.asignacion_id)} className="rounded-md px-2 py-1 text-xs text-[#c4554d] transition hover:bg-[#fdebec] disabled:opacity-50">Quitar</button>],
            }))}
            pie={
              <>
                <FilaNuevo texto="Asignar recurso" onClick={() => asignar.abrir()} />
                <PieLista cantidad={filas.length} hayMas={q.hasNextPage} cargando={q.isFetchingNextPage} onMas={() => q.fetchNextPage()} />
                {filas.length ? <p className="px-2 pb-2 text-sm text-suave">Total asignado: <span className="font-medium text-texto">{numero(total)}</span></p> : null}
              </>
            }
          />
        </Estado>
      </div>
      {asignar.valor ? <ModalAsignar proyecto_id={proyecto_id} onCerrar={asignar.cerrar} /> : null}
    </div>
  )
}
