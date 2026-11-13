export type EstadoProyecto = 'PLANIFICADO' | 'EN_CURSO' | 'COMPLETADO'
export type Prioridad = 'BAJA' | 'MEDIA' | 'ALTA'

export const ESTADOS: EstadoProyecto[] = ['PLANIFICADO', 'EN_CURSO', 'COMPLETADO']
export const ETIQUETA_ESTADO: Record<EstadoProyecto, string> = {
  PLANIFICADO: 'Planificado',
  EN_CURSO: 'En curso',
  COMPLETADO: 'Completado',
}

export interface Proyecto {
  tenant_id: string
  proyecto_id: string
  nombre: string
  descripcion?: string
  estado: EstadoProyecto
  prioridad: Prioridad
  avance_pct: number
  tareas_total: number
  tareas_completadas: number
  estado_presupuesto: 'NORMAL' | 'EXCEDIDO'
  portafolio_id?: string
  fecha_fin?: string
  creado_en: string
}

export interface Portafolio {
  tenant_id: string
  portafolio_id: string
  nombre: string
  descripcion?: string
}

export interface Resumen {
  total_proyectos?: number
  proy_PLANIFICADO?: number
  proy_EN_CURSO?: number
  proy_COMPLETADO?: number
  tareas_total?: number
  tareas_completadas?: number
  presupuestos_excedidos?: number
}

export interface Pagina<T> {
  items: T[]
  count: number
  last_key?: Record<string, unknown> | null
}
