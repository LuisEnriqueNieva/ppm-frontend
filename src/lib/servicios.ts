// Consultas y acciones de todos los microservicios (React Query). Complementa a hooks.ts.
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, del, post, put, type Micro } from './api'
import type {
  Adjunto, Asignacion, CriterioPeso, Gasto, Pagina, Portafolio, Presupuesto, Proyecto,
  Puntaje, Recurso, Tarea,
} from './tipos'

// ---------- Utilidades ----------

// Lista paginada con "Cargar más" (last_key)
function usePaginado<T>(clave: unknown[], micro: Micro, ruta: string, body: Record<string, unknown>, limit = 50, activo = true) {
  return useInfiniteQuery({
    queryKey: [...clave, body, limit],
    enabled: activo,
    initialPageParam: undefined as Record<string, unknown> | undefined,
    queryFn: ({ pageParam }) => post<Pagina<T>>(micro, ruta, { ...body, limit, last_key: pageParam }),
    getNextPageParam: (p) => p.last_key ?? undefined,
  })
}

// Búsqueda que devuelve null si el backend responde 404 (por ejemplo: "el proyecto no tiene presupuesto")
async function buscarONulo<T>(f: () => Promise<T>): Promise<T | null> {
  try {
    return await f()
  } catch (e) {
    if (e instanceof ApiError && e.codigo === 404) return null
    throw e
  }
}

// Mutación que invalida las consultas indicadas al terminar bien
// diferido: algunos cambios llegan a otros microservicios por eventos (SNS→SQS), que tardan
// uno o dos segundos; por eso se vuelve a consultar un instante después.
function useAccion<V, R>(fn: (v: V) => Promise<R>, invalidar: string[][], diferido = false) {
  const qc = useQueryClient()
  const refrescar = () => invalidar.forEach((k) => qc.invalidateQueries({ queryKey: k }))
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      refrescar()
      if (diferido) setTimeout(refrescar, 2500)
    },
  })
}

// ---------- Auth ----------
export const useCrearUsuario = () =>
  useMutation({
    mutationFn: (v: { usuario_id: string; password: string; rol: string }) =>
      post<{ usuario_id: string; rol: string }>('auth', '/auth/crear-usuario', v),
  })

// ---------- Proyectos ----------
export const useProyecto = (proyecto_id: string) =>
  useQuery({
    queryKey: ['proyecto', proyecto_id],
    queryFn: async () => (await post<{ proyecto: Proyecto }>('proyectos', '/proyectos/buscar', { proyecto_id })).proyecto,
  })

export const useModificarProyecto = () =>
  useAccion(
    (v: { proyecto_id: string; nombre?: string; descripcion?: string; estado?: string; portafolio_id?: string; fecha_fin?: string }) =>
      put('proyectos', '/proyectos/modificar', v),
    [['proyecto'], ['proyectos'], ['resumen'], ['portafolio']],
  )

export const useEliminarProyecto = () =>
  useAccion(
    (proyecto_id: string) => del('proyectos', '/proyectos/eliminar', { proyecto_id }),
    [['proyectos'], ['resumen'], ['portafolio']],
  )

// ---------- Portafolios ----------
export const usePortafolio = (portafolio_id: string, activo = true) =>
  useQuery({
    queryKey: ['portafolio', portafolio_id],
    enabled: activo,
    queryFn: () =>
      post<{ portafolio: Portafolio; total_proyectos: number }>('proyectos', '/portafolios/buscar', { portafolio_id }),
  })

export const useCrearPortafolio = () =>
  useAccion(
    (v: { nombre: string; descripcion?: string }) => post('proyectos', '/portafolios/crear', v),
    [['portafolios']],
  )

export const useModificarPortafolio = () =>
  useAccion(
    (v: { portafolio_id: string; nombre?: string; descripcion?: string }) => put('proyectos', '/portafolios/modificar', v),
    [['portafolios'], ['portafolio']],
  )

// ---------- Adjuntos ----------
export const useAdjuntos = (proyecto_id: string) =>
  useQuery({
    queryKey: ['adjuntos', proyecto_id],
    queryFn: async () => (await post<{ items: Adjunto[] }>('proyectos', '/adjuntos/listar', { proyecto_id })).items,
  })

// 1) pide la URL prefirmada, 2) sube el archivo directo a S3 con PUT.
// S3 avisa a RegistrarAdjunto (trigger), por eso la lista se refresca un instante después.
export function useSubirAdjunto(proyecto_id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (archivo: File) => {
      const r = await post<{ url: string }>('proyectos', '/adjuntos/url', { proyecto_id, nombre_archivo: archivo.name })
      let res: Response
      try {
        res = await fetch(r.url, { method: 'PUT', body: archivo })
      } catch {
        throw new ApiError(0, 'No se pudo subir el archivo a S3')
      }
      if (!res.ok) throw new ApiError(res.status, 'S3 rechazó la subida (la URL dura 5 minutos)')
    },
    onSuccess: () => {
      const refrescar = () => qc.invalidateQueries({ queryKey: ['adjuntos', proyecto_id] })
      setTimeout(refrescar, 1500)
      setTimeout(refrescar, 4000)
    },
  })
}

// ---------- Tareas ----------
export const useTareas = (proyecto_id: string) =>
  usePaginado<Tarea>(['tareas'], 'tareas', '/tareas/listar', { proyecto_id }, 50)

export const useTarea = (tarea_id: string) =>
  useQuery({
    queryKey: ['tarea', tarea_id],
    queryFn: async () => (await post<{ tarea: Tarea }>('tareas', '/tareas/buscar', { tarea_id })).tarea,
  })

type DatosTarea = { titulo?: string; descripcion?: string; estado?: string; prioridad?: string; asignado_a?: string; fecha_limite?: string; horas?: number }
// Una tarea cambia los contadores del proyecto (por eventos), por eso también se refresca el proyecto
const DESPUES_TAREA = [['tareas'], ['tarea'], ['proyecto'], ['proyectos'], ['resumen']]
export const useCrearTarea = () =>
  useAccion((v: DatosTarea & { proyecto_id: string; titulo: string }) => post('tareas', '/tareas/crear', v), DESPUES_TAREA, true)
export const useModificarTarea = () =>
  useAccion((v: DatosTarea & { tarea_id: string }) => put('tareas', '/tareas/modificar', v), DESPUES_TAREA, true)
export const useEliminarTarea = () =>
  useAccion((tarea_id: string) => del('tareas', '/tareas/eliminar', { tarea_id }), DESPUES_TAREA, true)

// ---------- Presupuestos y gastos ----------
export const usePresupuesto = (proyecto_id: string) =>
  useQuery({
    queryKey: ['presupuesto', proyecto_id],
    queryFn: () =>
      buscarONulo(async () =>
        (await post<{ presupuesto: Presupuesto }>('presupuestos', '/presupuestos/buscar', { proyecto_id })).presupuesto),
  })

const DESPUES_PRESUPUESTO = [['presupuesto'], ['gastos'], ['proyecto'], ['proyectos'], ['resumen']]
export const useCrearPresupuesto = () =>
  useAccion((v: { proyecto_id: string; monto_total: number }) => post('presupuestos', '/presupuestos/crear', v), DESPUES_PRESUPUESTO)
export const useModificarPresupuesto = () =>
  useAccion((v: { proyecto_id: string; monto_total: number }) => put('presupuestos', '/presupuestos/modificar', v), DESPUES_PRESUPUESTO)
export const useRegistrarGasto = () =>
  useAccion(
    (v: { proyecto_id: string; monto: number; concepto?: string; fecha?: string }) => post('presupuestos', '/gastos/registrar', v),
    DESPUES_PRESUPUESTO,
    true,
  )
export const useGastos = (proyecto_id: string) =>
  usePaginado<Gasto>(['gastos'], 'presupuestos', '/gastos/listar', { proyecto_id }, 50)

// ---------- Recursos y asignaciones ----------
export const useRecursos = (rol?: string) =>
  usePaginado<Recurso>(['recursos'], 'recursos', '/recursos/listar', rol ? { rol } : {}, 50)

export const useRecurso = (recurso_id: string) =>
  useQuery({
    queryKey: ['recurso', recurso_id],
    queryFn: async () => (await post<{ recurso: Recurso }>('recursos', '/recursos/buscar', { recurso_id })).recurso,
  })

type DatosRecurso = { nombre?: string; rol?: string; costo_hora?: number; capacidad_semanal?: number }
const DESPUES_RECURSO = [['recursos'], ['recurso'], ['asignaciones']]
export const useCrearRecurso = () =>
  useAccion((v: DatosRecurso & { nombre: string; costo_hora: number }) => post('recursos', '/recursos/crear', v), DESPUES_RECURSO)
export const useModificarRecurso = () =>
  useAccion((v: DatosRecurso & { recurso_id: string }) => put('recursos', '/recursos/modificar', v), DESPUES_RECURSO)
export const useEliminarRecurso = () =>
  useAccion((recurso_id: string) => del('recursos', '/recursos/eliminar', { recurso_id }), DESPUES_RECURSO)

export const useAsignaciones = (filtro: { proyecto_id?: string; recurso_id?: string }, activo = true) =>
  usePaginado<Asignacion>(['asignaciones'], 'recursos', '/asignaciones/listar', filtro, 50, activo)
// Crear una asignación suma al costo_proyectado del presupuesto (evento), por eso se refresca el presupuesto
export const useCrearAsignacion = () =>
  useAccion(
    (v: { proyecto_id: string; recurso_id: string; horas: number }) => post('recursos', '/asignaciones/crear', v),
    [['asignaciones'], ['presupuesto']],
    true,
  )

// ---------- Priorización ----------
export const useCriterios = () =>
  useQuery({
    queryKey: ['criterios'],
    queryFn: () => post<{ items: CriterioPeso[]; suma_pesos: number }>('priorizacion', '/criterios/listar'),
  })

export const useModificarCriterio = () =>
  useAccion((v: { criterio_id: string; peso: number }) => put('priorizacion', '/criterios/modificar', v), [['criterios']])

export const usePuntaje = (proyecto_id: string) =>
  useQuery({
    queryKey: ['puntaje', proyecto_id],
    queryFn: () =>
      buscarONulo(async () =>
        (await post<{ puntaje: Puntaje }>('priorizacion', '/puntajes/buscar', { proyecto_id })).puntaje),
  })

// Evaluar un proyecto actualiza su prioridad (evento hacia ms-proyectos)
export const useEvaluarProyecto = () =>
  useAccion(
    (v: { proyecto_id: string; valores: Record<string, number> }) => post('priorizacion', '/priorizacion/evaluar', v),
    [['puntaje'], ['ranking'], ['proyecto'], ['proyectos']],
    true,
  )
export const useRanking = (portafolio_id?: string) =>
  usePaginado<Puntaje>(['ranking'], 'priorizacion', '/puntajes/ranking', portafolio_id ? { portafolio_id } : {}, 50)
