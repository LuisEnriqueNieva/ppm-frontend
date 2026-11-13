import { useState } from 'react'
import { usePortafolios } from '../lib/hooks'
import { useCrearPortafolio, useModificarPortafolio, usePortafolio } from '../lib/servicios'
import { BotonPrimario, Campo, Cargando, Encabezado, entrada } from '../components/ui'
import { Icono } from '../components/Iconos'
import { FilaNuevo, ModalForm, Tabla, useModal } from '../components/comunes'
import { useQuery } from '@tanstack/react-query'
import { post } from '../lib/api'
import type { Portafolio } from '../lib/tipos'

function FormPortafolio({ inicial, onCerrar }: { inicial?: Portafolio; onCerrar: () => void }) {
  const crear = useCrearPortafolio()
  const modificar = useModificarPortafolio()
  // Al abrir un portafolio se consulta su detalle (endpoint buscar), que incluye el total de proyectos
  const detalle = usePortafolio(inicial?.portafolio_id ?? '', !!inicial)
  const [f, setF] = useState({ nombre: inicial?.nombre ?? '', descripcion: inicial?.descripcion ?? '' })
  const accion = inicial ? modificar : crear
  return (
    <ModalForm
      titulo={inicial ? 'Portafolio' : 'Nuevo portafolio'}
      onCerrar={onCerrar}
      cargando={accion.isPending}
      error={accion.error ?? detalle.error}
      deshabilitado={!f.nombre.trim()}
      etiqueta={inicial ? 'Guardar cambios' : 'Crear portafolio'}
      onEnviar={() => {
        const datos = { nombre: f.nombre.trim(), descripcion: f.descripcion }
        if (inicial) modificar.mutate({ portafolio_id: inicial.portafolio_id, ...datos }, { onSuccess: onCerrar })
        else crear.mutate(datos, { onSuccess: onCerrar })
      }}
    >
      {inicial ? (
        <p className="mb-4 text-sm text-suave">
          {detalle.isLoading ? 'Consultando…' : <>Este portafolio tiene <span className="font-medium text-texto">{detalle.data?.total_proyectos ?? 0}</span> proyectos.</>}
        </p>
      ) : null}
      <Campo etiqueta="Nombre"><input className={entrada} value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} placeholder="Nombre del portafolio" autoFocus /></Campo>
      <Campo etiqueta="Descripción"><textarea className={`${entrada} h-20 resize-none py-2`} value={f.descripcion} onChange={(e) => setF({ ...f, descripcion: e.target.value })} /></Campo>
    </ModalForm>
  )
}

export default function Portafolios() {
  const { data: lista = [], isLoading } = usePortafolios()
  const nuevo = useModal()
  const editar = useModal<Portafolio>()
  // total de proyectos por portafolio: se pide con el endpoint "buscar" de cada uno
  const totales = useQuery({
    queryKey: ['portafolios-totales', lista.map((p) => p.portafolio_id).join(',')],
    enabled: lista.length > 0,
    queryFn: async () => {
      const r = await Promise.all(
        lista.map((p) => post<{ total_proyectos: number }>('proyectos', '/portafolios/buscar', { portafolio_id: p.portafolio_id })),
      )
      return Object.fromEntries(lista.map((p, i) => [p.portafolio_id, r[i].total_proyectos]))
    },
  })

  return (
    <div>
      <Encabezado
        icono="📁"
        titulo="Portafolios"
        descripcion="Agrupa los proyectos de tu organización."
        acciones={<BotonPrimario onClick={() => nuevo.abrir()}><Icono n="mas" className="h-3.5 w-3.5" /> Nuevo portafolio</BotonPrimario>}
      />
      {isLoading ? <Cargando /> : (
        <Tabla
          columnas={[['Nombre', 'proyectos', 'min-w-[220px]'], ['Descripción', 'texto', 'min-w-[280px]'], ['Proyectos', 'tabla', 'min-w-[100px]']]}
          vacio="Aún no hay portafolios."
          filas={lista.map((p) => ({
            key: p.portafolio_id,
            onClick: () => editar.abrir(p),
            celdas: [
              <span className="flex items-center gap-2 font-medium" title={p.portafolio_id}><Icono n="proyectos" className="h-4 w-4 text-tenue" />{p.nombre}</span>,
              <span className="text-suave">{p.descripcion || '—'}</span>,
              <span className="tabular-nums text-suave">{totales.data?.[p.portafolio_id] ?? '…'}</span>,
            ],
          }))}
          pie={<FilaNuevo texto="Nuevo portafolio" onClick={() => nuevo.abrir()} />}
        />
      )}
      {nuevo.valor ? <FormPortafolio onCerrar={nuevo.cerrar} /> : null}
      {editar.valor ? <FormPortafolio inicial={editar.valor} onCerrar={editar.cerrar} /> : null}
    </div>
  )
}
