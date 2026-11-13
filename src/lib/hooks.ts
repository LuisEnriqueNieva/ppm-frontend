import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { post } from './api'
import type { Pagina, Portafolio, Proyecto, Resumen } from './tipos'

export interface FiltroProyectos {
  estado?: string
  portafolio_id?: string
}

// Paginacion con last_key: cada "Cargar mas" pide la pagina siguiente al backend
export function useProyectos(filtro: FiltroProyectos, limit = 20) {
  return useInfiniteQuery({
    queryKey: ['proyectos', filtro, limit],
    initialPageParam: undefined as Record<string, unknown> | undefined,
    queryFn: ({ pageParam }) =>
      post<Pagina<Proyecto>>('proyectos', '/proyectos/listar', { ...filtro, limit, last_key: pageParam }),
    getNextPageParam: (p) => p.last_key ?? undefined,
  })
}

export function usePortafolios() {
  return useQuery({
    queryKey: ['portafolios'],
    queryFn: async () =>
      (await post<Pagina<Portafolio>>('proyectos', '/portafolios/listar', { limit: 100 })).items,
  })
}

export function useResumen() {
  return useQuery({
    queryKey: ['resumen'],
    queryFn: async () => (await post<{ resumen: Resumen }>('proyectos', '/resumen/obtener')).resumen,
  })
}
