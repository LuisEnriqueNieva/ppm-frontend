// Nombre y color de cada tenant. El tenant real SIEMPRE viene del token en el backend;
// esto sólo sirve para pintar la interfaz.
export const TENANTS: Record<string, { nombre: string; color: string }> = {
  ACM: { nombre: 'ACM', color: '#7c5cfa' },
  ORACLE: { nombre: 'Oracle', color: '#e8508f' },
  LUDOTECA: { nombre: 'Ludoteca', color: '#0f9b84' },
}

export const colorDeTenant = (id: string) => TENANTS[id]?.color ?? '#7c5cfa'
export const nombreDeTenant = (id: string) => TENANTS[id]?.nombre ?? id

export const idDeSlug = (slug: string | undefined) => {
  const id = (slug ?? '').toUpperCase()
  return id in TENANTS ? id : null
}
export const slugDeTenant = (id: string) => id.toLowerCase()
export const rutaLogin = (id: string) => `/${slugDeTenant(id)}/login`

const CLAVE_TENANT = 'ppm_tenant'
export const guardarUltimoTenant = (id: string) => {
  try {
    sessionStorage.setItem(CLAVE_TENANT, id)
  } catch {
    return
  }
}
export const leerUltimoTenant = (): string | null => {
  try {
    return idDeSlug(sessionStorage.getItem(CLAVE_TENANT) ?? '')
  } catch {
    return null
  }
}
