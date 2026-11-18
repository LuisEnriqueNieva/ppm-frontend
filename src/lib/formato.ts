const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export function fecha(s?: string) {
  if (!s) return '—'
  const [a, m, d] = s.slice(0, 10).split('-')
  return `${parseInt(d)} ${MESES[parseInt(m) - 1]} ${a}`
}

// Búsqueda sin distinguir mayúsculas ni tildes ("planeacion" encuentra "Planeación")
export const normalizar = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
export const coincide = (texto: string, busqueda: string) => !busqueda.trim() || normalizar(texto).includes(normalizar(busqueda))
