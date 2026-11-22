import { leerUltimoTenant, rutaLogin } from './tenants'

const BASES = {
  auth: import.meta.env.VITE_API_AUTH as string,
  proyectos: import.meta.env.VITE_API_PROYECTOS as string,
  tareas: import.meta.env.VITE_API_TAREAS as string,
  presupuestos: import.meta.env.VITE_API_PRESUPUESTOS as string,
  recursos: import.meta.env.VITE_API_RECURSOS as string,
  priorizacion: import.meta.env.VITE_API_PRIORIZACION as string,
}
export type Micro = keyof typeof BASES

export interface Sesion {
  token: string
  tenant_id: string
  usuario_id: string
  rol: string
}

const CLAVE = 'ppm_sesion'
export const leerSesion = (): Sesion | null => {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE) ?? 'null')
  } catch {
    return null
  }
}
export const guardarSesion = (s: Sesion) => sessionStorage.setItem(CLAVE, JSON.stringify(s))
export const borrarSesion = () => sessionStorage.removeItem(CLAVE)

export class ApiError extends Error {
  codigo: number
  constructor(codigo: number, mensaje: string) {
    super(mensaje)
    this.codigo = codigo
  }
}

const MAX_SIMULTANEAS = 1
let enCurso = 0
const espera: Array<() => void> = []
async function conTurno<T>(tarea: () => Promise<T>): Promise<T> {
  if (enCurso >= MAX_SIMULTANEAS) await new Promise<void>((seguir) => espera.push(seguir))
  else enCurso++
  try {
    return await tarea()
  } finally {
    const siguiente = espera.shift()
    if (siguiente) siguiente()
    else enCurso--
  }
}

async function llamar<T>(micro: Micro, metodo: string, ruta: string, body?: unknown): Promise<T> {
  const base = BASES[micro]
  if (!base) throw new ApiError(0, `Falta la URL de ${micro} en el archivo .env`)
  const sesion = leerSesion()
  let res: Response
  try {
    res = await conTurno(() => fetch(base.replace(/\/$/, '') + ruta, {
      method: metodo,
      headers: {
        'Content-Type': 'application/json',
        ...(sesion ? { Authorization: sesion.token } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    }))
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor (revisa la URL y CORS)')
  }
  let datos: Record<string, unknown>
  try {
    datos = await res.json()
  } catch {
    throw new ApiError(res.status, 'Respuesta inválida del servidor')
  }
  const codigo = (datos.statusCode as number | undefined) ?? res.status
  if (codigo === 403 && sesion) {
    borrarSesion()
    const ultimo = leerUltimoTenant()
    window.location.href = ultimo ? rutaLogin(ultimo) : '/inicio'
  }
  if (codigo !== 200) {
    const msg = (datos.mensaje ?? datos.errorMessage ?? datos.message ?? 'Error') as string
    throw new ApiError(codigo, msg)
  }
  return datos as T
}

export const post = <T,>(micro: Micro, ruta: string, body: unknown = {}) =>
  llamar<T>(micro, 'POST', ruta, body)
export const put = <T,>(micro: Micro, ruta: string, body: unknown) =>
  llamar<T>(micro, 'PUT', ruta, body)
export const del = <T,>(micro: Micro, ruta: string, body: unknown) =>
  llamar<T>(micro, 'DELETE', ruta, body)
