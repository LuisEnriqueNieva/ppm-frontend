import { useState, type FormEvent, type ReactNode } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { post } from '../lib/api'
import { usePortafolios } from '../lib/hooks'
import { ESTADOS, ETIQUETA_ESTADO, type EstadoProyecto } from '../lib/tipos'
import { Icono } from './Iconos'
import { BotonPrimario, BotonSecundario, ErrorMsg, Modal, entradaSutil } from './ui'

// Fila de propiedad: etiqueta gris a la izquierda, valor editable a la derecha (como en una página de Notion)
const Propiedad = ({ icono, etiqueta, children }: { icono: string; etiqueta: string; children: ReactNode }) => (
  <label className="flex min-h-[34px] items-center gap-2">
    <span className="flex w-32 shrink-0 items-center gap-1.5 px-1 text-sm text-suave sm:w-40">
      <Icono n={icono} /> {etiqueta}
    </span>
    <span className="min-w-0 flex-1">{children}</span>
  </label>
)

export default function NuevoProyecto({ onCerrar, estadoInicial = 'PLANIFICADO' }: {
  onCerrar: () => void
  estadoInicial?: EstadoProyecto
}) {
  const qc = useQueryClient()
  const { data: portafolios = [] } = usePortafolios()
  const [f, setF] = useState({ nombre: '', descripcion: '', estado: estadoInicial as string, portafolio_id: '', fecha_fin: '' })
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }))

  const crear = useMutation({
    mutationFn: () =>
      post('proyectos', '/proyectos/crear', {
        nombre: f.nombre,
        descripcion: f.descripcion,
        estado: f.estado,
        ...(f.portafolio_id ? { portafolio_id: f.portafolio_id } : {}),
        ...(f.fecha_fin ? { fecha_fin: f.fecha_fin } : {}),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['proyectos'] })
      qc.invalidateQueries({ queryKey: ['resumen'] })
      onCerrar()
    },
  })

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    if (f.nombre.trim()) crear.mutate()
  }

  return (
    <Modal titulo="Proyectos" onCerrar={onCerrar} ancho="max-w-2xl">
      <form onSubmit={enviar} className="px-6 pb-5 sm:px-12">
        <div className="mb-2 text-5xl leading-none" aria-hidden="true">📄</div>
        <input
          className="w-full bg-transparent text-[32px] font-bold leading-tight tracking-[-0.02em] outline-none placeholder:text-[rgba(55,53,47,0.2)]"
          placeholder="Sin título"
          aria-label="Nombre del proyecto"
          value={f.nombre}
          onChange={(e) => set('nombre', e.target.value)}
          autoFocus
        />

        <div className="mt-4 space-y-0.5">
          <Propiedad icono="estado" etiqueta="Estado">
            <select className={entradaSutil} value={f.estado} onChange={(e) => set('estado', e.target.value)}>
              {ESTADOS.map((s) => (
                <option key={s} value={s}>{ETIQUETA_ESTADO[s]}</option>
              ))}
            </select>
          </Propiedad>
          <Propiedad icono="proyectos" etiqueta="Portafolio">
            <select className={entradaSutil} value={f.portafolio_id} onChange={(e) => set('portafolio_id', e.target.value)}>
              <option value="">Vacío</option>
              {portafolios.map((p) => (
                <option key={p.portafolio_id} value={p.portafolio_id}>{p.nombre}</option>
              ))}
            </select>
          </Propiedad>
          <Propiedad icono="calendario" etiqueta="Fecha fin">
            <input type="date" className={entradaSutil} value={f.fecha_fin} onChange={(e) => set('fecha_fin', e.target.value)} />
          </Propiedad>
        </div>

        <div className="my-4 border-t border-linea" />

        <textarea
          className="min-h-24 w-full resize-none bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-tenue"
          placeholder="Escribe una descripción…"
          aria-label="Descripción"
          value={f.descripcion}
          onChange={(e) => set('descripcion', e.target.value)}
        />

        {crear.error ? <div className="mb-3"><ErrorMsg error={crear.error} /></div> : null}
        <div className="flex items-center justify-end gap-2">
          <BotonSecundario type="button" onClick={onCerrar}>Cancelar</BotonSecundario>
          <BotonPrimario type="submit" disabled={!f.nombre.trim() || crear.isPending}>
            {crear.isPending ? 'Creando…' : 'Crear proyecto'}
          </BotonPrimario>
        </div>
      </form>
    </Modal>
  )
}
