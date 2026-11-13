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

// ---------- Tareas ----------
export type EstadoTarea = 'PENDIENTE' | 'EN_CURSO' | 'COMPLETADA'
export const ESTADOS_TAREA: EstadoTarea[] = ['PENDIENTE', 'EN_CURSO', 'COMPLETADA']
export const ETIQUETA_ESTADO_TAREA: Record<EstadoTarea, string> = {
  PENDIENTE: 'Pendiente',
  EN_CURSO: 'En curso',
  COMPLETADA: 'Completada',
}
export const PRIORIDADES: Prioridad[] = ['BAJA', 'MEDIA', 'ALTA']

export interface Tarea {
  tenant_id: string
  tarea_id: string
  proyecto_id: string
  titulo: string
  descripcion?: string
  estado: EstadoTarea
  prioridad: Prioridad
  asignado_a?: string
  fecha_limite?: string
  horas?: number
  creado_en: string
}

// ---------- Presupuestos ----------
export interface Presupuesto {
  tenant_id: string
  proyecto_id: string
  monto_total: number
  gasto_acumulado: number
  costo_proyectado: number
  estado_presupuesto: 'NORMAL' | 'EXCEDIDO'
  creado_en: string
}

export interface Gasto {
  tenant_id: string
  gasto_id: string
  proyecto_id: string
  monto: number
  concepto?: string
  fecha: string
}

// ---------- Recursos ----------
export interface Recurso {
  tenant_id: string
  recurso_id: string
  nombre: string
  rol?: string
  costo_hora: number
  capacidad_semanal?: number
  creado_en: string
}

export interface Asignacion {
  tenant_id: string
  asignacion_id: string
  proyecto_id: string
  recurso_id: string
  horas: number
  costo_hora: number
  costo: number
}

// ---------- Adjuntos ----------
export interface Adjunto {
  tenant_id: string
  adjunto_id: string
  proyecto_id: string
  clave_s3: string
  nombre: string
  tamano_bytes: number
  subido_en: string
  url_descarga?: string
}

// ---------- Priorización ----------
export type Criterio = 'valor' | 'urgencia' | 'costo' | 'riesgo'
export const CRITERIOS: Criterio[] = ['valor', 'urgencia', 'costo', 'riesgo']
export const ETIQUETA_CRITERIO: Record<Criterio, string> = {
  valor: 'Valor',
  urgencia: 'Urgencia',
  costo: 'Costo',
  riesgo: 'Riesgo',
}

export interface CriterioPeso {
  criterio_id: Criterio
  peso: number
  invertido: boolean
}

export interface Puntaje {
  tenant_id: string
  proyecto_id: string
  portafolio_id?: string
  puntaje: number
  prioridad: Prioridad
  valores: Partial<Record<Criterio, number>>
  evaluado_en: string
}
