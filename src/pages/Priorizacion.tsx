import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePortafolios, useProyectos } from '../lib/hooks'
import { useCriterios, useModificarCriterio, useRanking } from '../lib/servicios'
import { CRITERIOS, ETIQUETA_CRITERIO, type CriterioPeso, type Prioridad } from '../lib/tipos'
import { BotonPrimario, Callout, Encabezado, ErrorMsg, PrioridadBadge, entrada } from '../components/ui'
import { Estado, PieLista, Tabla, numero } from '../components/comunes'

function FilaCriterio({ c }: { c: CriterioPeso }) {
  const modificar = useModificarCriterio()
  const [peso, setPeso] = useState(String(c.peso))
  const cambio = Number(peso) !== c.peso
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-linea py-2">
      <span className="w-28 text-sm font-medium">{ETIQUETA_CRITERIO[c.criterio_id]}</span>
      <span className="w-40 text-xs text-tenue">{c.invertido ? 'Un valor alto resta puntaje' : 'Un valor alto suma puntaje'}</span>
      <input type="number" min="0" max="1" step="0.05" className={`${entrada} w-24`} value={peso} onChange={(e) => setPeso(e.target.value)} aria-label={`Peso de ${c.criterio_id}`} />
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
      <Encabezado icono="🎯" titulo="Priorización" descripcion="Pesos de los criterios y ranking de proyectos por puntaje." />

      <h2 className="mb-1 text-xs font-medium text-suave">Pesos de los criterios</h2>
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
        <h2 className="text-xs font-medium text-suave">Ranking de proyectos</h2>
        <select aria-label="Filtrar ranking por portafolio" className="h-7 max-w-52 cursor-pointer rounded-full border border-linea bg-transparent px-3 text-sm text-suave outline-none hover:bg-hover" value={portafolio} onChange={(e) => setPortafolio(e.target.value)}>
          <option value="">Todos los portafolios</option>
          {portafolios.map((p) => <option key={p.portafolio_id} value={p.portafolio_id}>{p.nombre}</option>)}
        </select>
      </div>
      {ranking.error ? <div className="pt-3"><ErrorMsg error={ranking.error} /></div> : null}
      <Estado q={ranking}>
        <Tabla
          columnas={[['#', 'texto', 'w-12'], ['Proyecto', 'proyectos', 'min-w-[240px]'], ['Puntaje', 'objetivo', 'min-w-[100px]'], ['Prioridad', 'bandera', 'min-w-[110px]'], ['Evaluado', 'calendario', 'min-w-[150px]']]}
          vacio="Aún no hay proyectos con puntaje."
          filas={filas.map((p, i) => ({
            key: p.proyecto_id,
            celdas: [
              <span className="tabular-nums text-tenue">{i + 1}</span>,
              <Link to={`/proyectos/${p.proyecto_id}`} className="font-medium hover:underline">{nombre(p.proyecto_id)}</Link>,
              <span className="tabular-nums font-medium">{numero(p.puntaje)}</span>,
              <PrioridadBadge prioridad={p.prioridad as Prioridad} />,
              <span className="text-suave">{p.evaluado_en?.slice(0, 16)}</span>,
            ],
          }))}
          pie={<PieLista cantidad={filas.length} hayMas={ranking.hasNextPage} cargando={ranking.isFetchingNextPage} onMas={() => ranking.fetchNextPage()} />}
        />
      </Estado>
    </div>
  )
}
