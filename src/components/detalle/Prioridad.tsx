import { useState } from 'react'
import { useEvaluarProyecto, usePuntaje } from '../../lib/servicios'
import { CRITERIOS, ETIQUETA_CRITERIO, type Criterio, type Prioridad as TipoPrioridad } from '../../lib/tipos'
import { BotonPrimario, Callout, Campo, PrioridadBadge, entrada } from '../ui'
import { BarraSeccion, Cifra, Estado, numero } from '../comunes'

const AYUDA: Record<Criterio, string> = {
  valor: 'Cuánto valor aporta (5 = mucho)',
  urgencia: 'Qué tan urgente es (5 = muy urgente)',
  costo: 'Qué tan costoso es (5 = muy costoso, resta puntaje)',
  riesgo: 'Qué tan riesgoso es (5 = muy riesgoso, resta puntaje)',
}

export default function Prioridad({ proyecto_id }: { proyecto_id: string }) {
  const q = usePuntaje(proyecto_id)
  const evaluar = useEvaluarProyecto()
  const p = q.data
  const [v, setV] = useState<Record<Criterio, string>>({ valor: '', urgencia: '', costo: '', riesgo: '' })
  const valor = (c: Criterio) => v[c] || String(p?.valores?.[c] ?? 3)
  const valido = CRITERIOS.every((c) => Number(valor(c)) >= 1 && Number(valor(c)) <= 5)

  return (
    <Estado q={q}>
      <BarraSeccion titulo="Puntaje de priorización" />
      {p ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <Cifra etiqueta="Puntaje" valor={numero(p.puntaje)} pie="De 1 a 5" />
          <Cifra etiqueta="Prioridad" valor={<PrioridadBadge prioridad={p.prioridad as TipoPrioridad} />} pie="Se refleja en el proyecto" />
          <Cifra etiqueta="Evaluado" valor={<span className="text-base">{p.evaluado_en?.slice(0, 16)}</span>} />
        </div>
      ) : (
        <Callout icono="🎯">Este proyecto todavía no tiene puntaje. Evalúalo con los 4 criterios.</Callout>
      )}

      <BarraSeccion titulo="Evaluar proyecto" />
      <form
        className="grid gap-x-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault()
          const valores = Object.fromEntries(CRITERIOS.map((c) => [c, Number(valor(c))]))
          evaluar.mutate({ proyecto_id, valores })
        }}
      >
        {CRITERIOS.map((c) => (
          <Campo key={c} etiqueta={`${ETIQUETA_CRITERIO[c]} — ${AYUDA[c]}`}>
            <input type="number" min="1" max="5" step="0.5" className={entrada} value={valor(c)} onChange={(e) => setV((x) => ({ ...x, [c]: e.target.value }))} />
          </Campo>
        ))}
        <div className="sm:col-span-2">
          <BotonPrimario type="submit" disabled={!valido || evaluar.isPending}>{evaluar.isPending ? 'Evaluando…' : 'Evaluar'}</BotonPrimario>
          {evaluar.error ? <p className="mt-2 text-sm text-[#c4554d]">{evaluar.error instanceof Error ? evaluar.error.message : 'Error'}</p> : null}
        </div>
      </form>
    </Estado>
  )
}
