import { useState } from 'react'
import {
  useCrearPresupuesto, useGastos, useModificarPresupuesto, usePresupuesto, useRegistrarGasto,
} from '../../lib/servicios'
import { fecha } from '../../lib/formato'
import { BotonPrimario, BotonSecundario, Callout, Campo, ExcedidoBadge, Etiqueta, entrada } from '../ui'
import { Icono } from '../Iconos'
import { BarraSeccion, Cifra, Estado, ModalForm, PieLista, Tabla, numero, useModal } from '../comunes'

function ModalMonto({ proyecto_id, actual, onCerrar }: { proyecto_id: string; actual?: number; onCerrar: () => void }) {
  const crear = useCrearPresupuesto()
  const modificar = useModificarPresupuesto()
  const [monto, setMonto] = useState(actual != null ? String(actual) : '')
  const accion = actual != null ? modificar : crear
  const valor = Number(monto)
  return (
    <ModalForm
      titulo={actual != null ? 'Cambiar monto total' : 'Crear presupuesto'}
      onCerrar={onCerrar}
      cargando={accion.isPending}
      error={accion.error}
      deshabilitado={!(valor > 0)}
      etiqueta={actual != null ? 'Guardar' : 'Crear presupuesto'}
      onEnviar={() => accion.mutate({ proyecto_id, monto_total: valor }, { onSuccess: onCerrar })}
    >
      <Campo etiqueta="Monto total">
        <input type="number" min="0" step="0.01" className={entrada} value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0.00" autoFocus />
      </Campo>
    </ModalForm>
  )
}

function ModalGasto({ proyecto_id, onCerrar }: { proyecto_id: string; onCerrar: () => void }) {
  const registrar = useRegistrarGasto()
  const [f, setF] = useState({ monto: '', concepto: '', fecha: '' })
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }))
  return (
    <ModalForm
      titulo="Registrar gasto"
      onCerrar={onCerrar}
      cargando={registrar.isPending}
      error={registrar.error}
      deshabilitado={!(Number(f.monto) > 0)}
      etiqueta="Registrar gasto"
      onEnviar={() =>
        registrar.mutate(
          { proyecto_id, monto: Number(f.monto), concepto: f.concepto.trim(), ...(f.fecha ? { fecha: f.fecha } : {}) },
          { onSuccess: onCerrar },
        )
      }
    >
      <Campo etiqueta="Monto">
        <input type="number" min="0" step="0.01" className={entrada} value={f.monto} onChange={(e) => set('monto', e.target.value)} placeholder="0.00" autoFocus />
      </Campo>
      <Campo etiqueta="Concepto">
        <input className={entrada} value={f.concepto} onChange={(e) => set('concepto', e.target.value)} placeholder="En qué se gastó" />
      </Campo>
      <Campo etiqueta="Fecha (opcional, por defecto hoy)">
        <input type="date" className={entrada} value={f.fecha} onChange={(e) => set('fecha', e.target.value)} />
      </Campo>
    </ModalForm>
  )
}

export default function Presupuesto({ proyecto_id }: { proyecto_id: string }) {
  const q = usePresupuesto(proyecto_id)
  const gastos = useGastos(proyecto_id)
  const monto = useModal()
  const gasto = useModal()
  const p = q.data
  const filas = gastos.data?.pages.flatMap((x) => x.items) ?? []
  const pct = p && p.monto_total > 0 ? Math.min(100, Math.round((100 * p.gasto_acumulado) / p.monto_total)) : 0

  return (
    <Estado q={q}>
      {!p ? (
        <div className="pt-4">
          <Callout icono="💰">Este proyecto todavía no tiene presupuesto. Créalo para poder registrar gastos.</Callout>
          <div className="mt-3">
            <BotonPrimario onClick={() => monto.abrir()}><Icono n="mas" className="h-3.5 w-3.5" /> Crear presupuesto</BotonPrimario>
          </div>
        </div>
      ) : (
        <div>
          <BarraSeccion titulo="Presupuesto">
            {p.estado_presupuesto === 'EXCEDIDO' ? <ExcedidoBadge /> : <Etiqueta color="verde" punto>Normal</Etiqueta>}
            <BotonSecundario onClick={() => monto.abrir()}><Icono n="editar" /> Cambiar monto</BotonSecundario>
            <BotonPrimario onClick={() => gasto.abrir()}><Icono n="mas" className="h-3.5 w-3.5" /> Registrar gasto</BotonPrimario>
          </BarraSeccion>
          <div className="grid gap-3 sm:grid-cols-3">
            <Cifra etiqueta="Monto total" valor={numero(p.monto_total)} />
            <Cifra etiqueta="Gasto acumulado" valor={numero(p.gasto_acumulado)} pie={`${pct}% del monto total`} />
            <Cifra etiqueta="Costo proyectado" valor={numero(p.costo_proyectado)} pie="Suma de las asignaciones de recursos" />
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-hover">
            <div className={`h-full rounded-full transition-all duration-700 ${p.estado_presupuesto === 'EXCEDIDO' ? 'bg-[#e16f64]' : 'bg-acento'}`} style={{ width: `${pct}%` }} />
          </div>

          <BarraSeccion titulo="Gastos registrados" />
          <Estado q={gastos}>
            <Tabla
              columnas={[['Fecha', 'calendario', 'min-w-[120px]'], ['Concepto', 'texto', 'min-w-[240px]'], ['Monto', 'moneda', 'min-w-[120px]']]}
              vacio="Aún no hay gastos registrados."
              filas={filas.map((g) => ({
                key: g.gasto_id,
                celdas: [<span className="text-suave">{fecha(g.fecha)}</span>, g.concepto || <span className="text-tenue">Sin concepto</span>, <span className="tabular-nums">{numero(g.monto)}</span>],
              }))}
              pie={<PieLista cantidad={filas.length} hayMas={gastos.hasNextPage} cargando={gastos.isFetchingNextPage} onMas={() => gastos.fetchNextPage()} />}
            />
          </Estado>
        </div>
      )}
      {monto.valor ? <ModalMonto proyecto_id={proyecto_id} actual={p?.monto_total} onCerrar={monto.cerrar} /> : null}
      {gasto.valor ? <ModalGasto proyecto_id={proyecto_id} onCerrar={gasto.cerrar} /> : null}
    </Estado>
  )
}
