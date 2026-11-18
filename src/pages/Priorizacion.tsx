import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePortafolios, useProyectos } from '../lib/hooks'
import { useCriterios, useModificarCriterio, useRanking } from '../lib/servicios'
import { CRITERIOS, ETIQUETA_CRITERIO, type Criterio, type CriterioPeso, type Prioridad } from '../lib/tipos'
import { BotonPrimario, Callout, Encabezado, ErrorMsg, PrioridadBadge, entrada } from '../components/ui'
import { Estado, PieLista, Tabla, numero } from '../components/comunes'

const DESCRIPCION: Record<Criterio, string> = {
  valor: 'Cuánto beneficio aporta el proyecto. Más valor, más puntaje.',
  urgencia: 'Qué tan pronto hay que hacerlo. Más urgencia, más puntaje.',
  costo: 'Cuánto cuesta. Un costo alto RESTA puntaje.',
  riesgo: 'Qué tan riesgoso es. Un riesgo alto RESTA puntaje.',
}

function FilaCriterio({ c }: { c: CriterioPeso }) {
  const modificar = useModificarCriterio()
  const [peso, setPeso] = useState(String(c.peso))
  const cambio = Number(peso) !== c.peso
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-linea py-2">
      <span className="w-28 text-sm font-medium">{ETIQUETA_CRITERIO[c.criterio_id]}</span>
      <span className="min-w-[14rem] flex-1 text-xs text-tenue">{DESCRIPCION[c.criterio_id]}</span>
      <input type="number" min="0" max="1" step="0.05" style={{ width: '6rem' }} className={entrada} value={peso} onChange={(e) => setPeso(e.target.value)} aria-label={`Peso de ${c.criterio_id}`} />
      <BotonPrimario disabled={!cambio || modificar.isPending || !(Number(peso) >= 0 && Number(peso) <= 1)} onClick={() => modificar.mutate({ criterio_id: c.criterio_id, peso: Number(peso) })}>
        {modificar.isPending ? 'Guardando…' : 'Guardar'}
      </BotonPrimario>
      {modificar.error ? <span className="text-sm text-[#c4554d]">{modificar.error instanceof Error ? modificar.error.message : 'Error'}</span> : null}
    </div>
  )
}

export default function Priorizacion() {
  const criterios = useCriterios()
  const { data: portafolios = [] } = usePortafolios()
  const [portafolio, setPortafolio] = useState('')
  const ranking = useRanking(portafolio || undefined)
  const proyectos = useProyectos({}, 100)
  const nombre = (id: string) => proyectos.data?.pages.flatMap((p) => p.items).find((x) => x.proyecto_id === id)?.nombre ?? id
  const filas = ranking.data?.pages.flatMap((p) => p.items) ?? []
  const items = criterios.data?.items ?? []
  const orden = [...items].sort((a, b) => CRITERIOS.indexOf(a.criterio_id) - CRITERIOS.indexOf(b.criterio_id))

  return (
    <div>
      <Encabezado icono="🎯" titulo="Priorización" descripcion="Decide qué proyectos conviene atender primero, con un puntaje calculado." />

      <Callout icono="💡">
        <p className="font-medium">¿Cómo funciona?</p>
        <ol className="mt-1 list-decimal space-y-1 pl-5">
          <li>Cada proyecto se <b>califica de 1 a 5</b> en cuatro criterios (valor, urgencia, costo y riesgo). Eso se hace dentro del proyecto, en su pestaña <b>Prioridad</b>. En esta pantalla no se califican proyectos.</li>
          <li>Aquí defines el <b>peso</b> de cada criterio, es decir, cuánto importa en el cálculo (de 0 a 1; lo ideal es que sumen 1).</li>
          <li>El <b>puntaje</b> de cada proyecto es el promedio de sus calificaciones multiplicadas por esos pesos. Costo y riesgo se invierten (6 − calificación): un costo alto resta.</li>
          <li>Con el puntaje, el proyecto recibe su <b>prioridad</b>: 3.5 o más es Alta, de 2.5 a 3.49 es Media y menos de 2.5 es Baja. La prioridad se actualiza sola en el proyecto.</li>
        </ol>
      </Callout>

      <h2 className="mb-1 mt-8 text-xs font-medium text-suave">1. Peso de cada criterio (cuánto importa)</h2>
      <Estado q={criterios}>
        <div>{orden.map((c) => <FilaCriterio key={`${c.criterio_id}-${c.peso}`} c={c} />)}</div>
        <div className="mt-3">
          {criterios.data && Math.abs(criterios.data.suma_pesos - 1) > 0.001 ? (
            <Callout icono="⚠️" tono="rojo">Los pesos suman <b>{numero(criterios.data.suma_pesos)}</b>. Lo recomendable es que sumen 1.</Callout>
          ) : (
            <p className="text-xs text-tenue">Suma de pesos: {numero(criterios.data?.suma_pesos, 2)}</p>
          )}
        </div>
      </Estado>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs font-medium text-suave">2. Ranking de proyectos (resultado, del mayor puntaje al menor)</h2>
        <select aria-label="Filtrar ranking por portafolio" className="h-7 max-w-52 cursor-pointer rounded-full border border-linea bg-transparent px-3 text-sm text-suave outline-none hover:bg-hover" value={portafolio} onChange={(e) => setPortafolio(e.target.value)}>
          <option value="">Todos los portafolios</option>
          {portafolios.map((p) => <option key={p.portafolio_id} value={p.portafolio_id}>{p.nombre}</option>)}
        </select>
      </div>
      {ranking.error ? <div className="pt-3"><ErrorMsg error={ranking.error} /></div> : null}
      <Estado q={ranking}>
        <Tabla
          columnas={[['#', 'texto', 'w-12'], ['Proyecto', 'proyectos', 'min-w-[200px]'], ['Puntaje', 'objetivo', 'min-w-[90px]'], ['Prioridad', 'bandera', 'min-w-[100px]'],
            ['Valor', 'progreso', 'w-20'], ['Urgencia', 'progreso', 'w-24'], ['Costo', 'progreso', 'w-20'], ['Riesgo', 'progreso', 'w-20'], ['Evaluado', 'calendario', 'min-w-[140px]']]}
          vacio="Aún no hay proyectos evaluados. Entra a un proyecto, pestaña Prioridad, y pulsa Evaluar."
          filas={filas.map((p, i) => ({
            key: p.proyecto_id,
            celdas: [
              <span className="tabular-nums text-tenue">{i + 1}</span>,
              <Link to={`/proyectos/${p.proyecto_id}`} className="font-medium hover:underline">{nombre(p.proyecto_id)}</Link>,
              <span className="tabular-nums font-medium">{numero(p.puntaje)}</span>,
              <PrioridadBadge prioridad={p.prioridad as Prioridad} />,
              ...CRITERIOS.map((c) => <span key={c} className="tabular-nums text-suave">{p.valores?.[c] ?? '—'}</span>),
              <span className="text-suave">{p.evaluado_en?.slice(0, 16)}</span>,
            ],
          }))}
          pie={<PieLista cantidad={filas.length} hayMas={ranking.hasNextPage} cargando={ranking.isFetchingNextPage} onMas={() => ranking.fetchNextPage()} />}
        />
      </Estado>
    </div>
  )
}
