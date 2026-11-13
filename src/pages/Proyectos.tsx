import { useState } from 'react'
import { usePortafolios } from '../lib/hooks'
import { ESTADOS, ETIQUETA_ESTADO, type EstadoProyecto } from '../lib/tipos'
import { BotonPrimario, Encabezado } from '../components/ui'
import { Icono } from '../components/Iconos'
import NuevoProyecto from '../components/NuevoProyecto'
import VistaKanban from '../components/VistaKanban'
import VistaTabla from '../components/VistaTabla'

type Vista = 'tabla' | 'kanban'
const VISTAS: { id: Vista; nombre: string; icono: string }[] = [
  { id: 'tabla', nombre: 'Tabla', icono: 'tabla' },
  { id: 'kanban', nombre: 'Tablero', icono: 'tablero' },
]

// Filtro tipo Notion: píldora gris que se vuelve azul cuando está activo
const filtroCss = (activo: boolean) =>
  `h-7 max-w-52 cursor-pointer appearance-none rounded-full border pl-3 pr-7 text-sm outline-none transition ${
    activo
      ? 'border-azul/30 bg-azul/10 text-azul'
      : 'border-linea bg-transparent text-suave hover:bg-hover'
  }`

export default function Proyectos() {
  const [vista, setVista] = useState<Vista>('tabla')
  const [estado, setEstado] = useState('')
  const [portafolio, setPortafolio] = useState('')
  const [nuevo, setNuevo] = useState<EstadoProyecto | null>(null)
  const { data: portafolios = [] } = usePortafolios()

  const nombrePortafolio = (id?: string) =>
    id ? (portafolios.find((p) => p.portafolio_id === id)?.nombre ?? id) : 'Sin portafolio'

  // El backend filtra por UNA sola cosa a la vez: al elegir una, se limpia la otra
  const filtro = estado ? { estado } : portafolio ? { portafolio_id: portafolio } : {}

  return (
    <div>
      <Encabezado icono="🗂️" titulo="Proyectos" descripcion="Todos los proyectos de tu organización." />

      {/* Barra de vistas de la base de datos */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-linea">
        <div className="flex items-center gap-1" role="tablist">
          {VISTAS.map((v) => (
            <button
              key={v.id}
              role="tab"
              aria-selected={vista === v.id}
              onClick={() => setVista(v.id)}
              className={`relative flex h-10 items-center gap-1.5 px-2 text-sm transition ${
                vista === v.id ? 'font-medium text-texto' : 'text-suave hover:text-texto'
              }`}
            >
              <Icono n={v.icono} /> {v.nombre}
              {vista === v.id ? <span className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-texto" /> : null}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 py-1.5">
          {vista === 'tabla' ? (
            <>
              <span className="relative">
              <select
                aria-label="Filtrar por estado"
                className={filtroCss(!!estado)}
                value={estado}
                onChange={(e) => { setEstado(e.target.value); setPortafolio('') }}
              >
                <option value="">Estado</option>
                {ESTADOS.map((s) => (
                  <option key={s} value={s}>{ETIQUETA_ESTADO[s]}</option>
                ))}
              </select>
              <Icono n="abajo" className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-tenue" />
              </span>
              <span className="relative">
              <select
                aria-label="Filtrar por portafolio"
                className={filtroCss(!!portafolio)}
                value={portafolio}
                onChange={(e) => { setPortafolio(e.target.value); setEstado('') }}
              >
                <option value="">Portafolio</option>
                {portafolios.map((p) => (
                  <option key={p.portafolio_id} value={p.portafolio_id}>{p.nombre}</option>
                ))}
              </select>
              <Icono n="abajo" className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-tenue" />
              </span>
              {estado || portafolio ? (
                <button
                  onClick={() => { setEstado(''); setPortafolio('') }}
                  className="h-7 rounded-md px-2 text-sm text-tenue transition hover:bg-hover hover:text-texto"
                >
                  Limpiar
                </button>
              ) : null}
            </>
          ) : null}
          <BotonPrimario onClick={() => setNuevo('PLANIFICADO')}>
            <Icono n="mas" className="h-3.5 w-3.5" /> Nuevo
          </BotonPrimario>
        </div>
      </div>

      <div className="pt-1">
        {vista === 'tabla' ? (
          <VistaTabla filtro={filtro} nombrePortafolio={nombrePortafolio} onNuevo={() => setNuevo('PLANIFICADO')} />
        ) : (
          <VistaKanban nombrePortafolio={nombrePortafolio} onNuevo={setNuevo} />
        )}
      </div>
      {nuevo ? <NuevoProyecto estadoInicial={nuevo} onCerrar={() => setNuevo(null)} /> : null}
    </div>
  )
}
