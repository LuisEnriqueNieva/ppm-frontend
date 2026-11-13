import type { ReactNode } from 'react'

// Íconos de línea finos (24x24, trazo 1.7), al estilo de la interfaz de Notion.
const TRAZOS: Record<string, ReactNode> = {
  inicio: <path d="M4 20V10m6 10V4m6 16v-7m4 7H2" />,
  proyectos: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  tabla: <path d="M4 5h16v14H4zM4 10h16M10 10v9" />,
  tablero: <path d="M4 4h4v16H4zM10 4h4v10h-4zM16 4h4v13h-4z" />,
  mas: <path d="M12 5v14M5 12h14" />,
  salir: <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l4-4-4-4M14 12H4" />,
  abajo: <path d="m7 10 5 5 5-5" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  cerrar: <path d="M6 6l12 12M18 6 6 18" />,
  estado: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  bandera: <path d="M5 21V4m0 0h11l-2 4 2 4H5" />,
  calendario: <path d="M5 6h14v14H5zM5 10h14M9 3v4m6-4v4" />,
  texto: <path d="M5 7h14M5 12h14M5 17h9" />,
  progreso: <path d="M4 12a8 8 0 1 0 8-8m0 0v8l5 3" />,
  moneda: <path d="M12 3v18M16.5 7.5c0-1.7-2-3-4.5-3s-4.5 1.3-4.5 3 2 2.7 4.5 3 4.5 1.3 4.5 3-2 3-4.5 3-4.5-1.3-4.5-3" />,
  edificio: <path d="M4 21V5l8-2v18m0-12h8v12M8 8h.01M8 12h.01M8 16h.01M16 13h.01M16 17h.01M2 21h20" />,
  flecha: <path d="M5 12h14m-6-6 6 6-6 6" />,
  check: <path d="m5 12 4.5 4.5L19 7" />,
  pagina: <path d="M7 3h7l5 5v13H7zM14 3v5h5" />,
  arrastrar: <path d="M9 6h.01M9 12h.01M9 18h.01M15 6h.01M15 12h.01M15 18h.01" />,
  editar: <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16zM13.5 6.5l4 4" />,
  basura: <path d="M5 7h14M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
  clip: <path d="m20 11-8.5 8.5a5 5 0 0 1-7-7L13 4a3.3 3.3 0 0 1 5 5l-8.5 8.5a1.7 1.7 0 0 1-2.5-2.5L14 8" />,
  usuario: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" />,
  objetivo: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
}

export const Icono = ({ n, className = 'h-4 w-4' }: { n: string; className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    {TRAZOS[n]}
  </svg>
)
