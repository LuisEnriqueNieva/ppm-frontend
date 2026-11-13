// Nombre y color de cada tenant. El tenant real SIEMPRE viene del token en el backend;
// esto sólo sirve para pintar la interfaz.
export const TENANTS: Record<string, { nombre: string; color: string }> = {
  ACM: { nombre: 'ACM', color: '#7c5cfa' },
  ORACLE: { nombre: 'Oracle', color: '#e8508f' },
  LUDOTECA: { nombre: 'Ludoteca', color: '#0f9b84' },
}

export const colorDeTenant = (id: string) => TENANTS[id]?.color ?? '#7c5cfa'
export const nombreDeTenant = (id: string) => TENANTS[id]?.nombre ?? id
