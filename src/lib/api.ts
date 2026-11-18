// Capa de acceso a los 6 microservicios. Cada uno tiene su propia URL (su propio API Gateway).
// Los Lambdas devuelven HTTP 200 siempre; el codigo real viene dentro del JSON (statusCode).

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

// sessionStorage: cada pestaña tiene su propia sesion (util para la demo con 2 tenants)
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

// Maximo 2 peticiones al mismo tiempo (cada una ejecuta 1 Lambda, y a veces otra para validar el token).
// Asi nunca hay muchos Lambdas simultaneos en el Learner Lab, sin importar cuantas pantallas pidan datos.
const MAX_SIMULTANEAS = 2
let enCurso = 0
const espera: Array<() => void> = []
async function conTurno<T>(tarea: () => Promise<T>): Promise<T> {
  if (enCurso >= MAX_SIMULTANEAS) await new Promise<void>((seguir) => espera.push(seguir))
  enCurso++
  try {
    return await tarea()
  } finally {
    enCurso--
    espera.shift()?.()
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
    // token vencido o inválido: volver al login
    borrarSesion()
    window.location.href = '/login'
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
