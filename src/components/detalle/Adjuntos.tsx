import { useRef } from 'react'
import { useAdjuntos, useSubirAdjunto } from '../../lib/servicios'
import { fecha } from '../../lib/formato'
import { BotonPrimario, BotonSecundario, Callout, ErrorMsg } from '../ui'
import { Icono } from '../Iconos'
import { BarraSeccion, Estado, Tabla, bytes } from '../comunes'

export default function Adjuntos({ proyecto_id }: { proyecto_id: string }) {
  const q = useAdjuntos(proyecto_id)
  const subir = useSubirAdjunto(proyecto_id)
  const input = useRef<HTMLInputElement>(null)
  const items = q.data ?? []

  return (
    <div>
      <BarraSeccion titulo="Archivos adjuntos">
        <BotonSecundario onClick={() => q.refetch()} disabled={q.isFetching}>Actualizar</BotonSecundario>
        <input
          ref={input}
          type="file"
          className="hidden"
          onChange={(e) => {
            const archivo = e.target.files?.[0]
            if (archivo) subir.mutate(archivo)
            e.target.value = ''
          }}
        />
        <BotonPrimario onClick={() => input.current?.click()} disabled={subir.isPending}>
          <Icono n="clip" className="h-3.5 w-3.5" /> {subir.isPending ? 'Subiendo…' : 'Subir archivo'}
        </BotonPrimario>
      </BarraSeccion>
      {subir.error ? <div className="mb-3"><ErrorMsg error={subir.error} /></div> : null}
      {subir.isSuccess ? <div className="mb-3"><Callout icono="✅" tono="verde">Archivo subido. En unos segundos aparece en la lista (S3 avisa y se registra solo).</Callout></div> : null}
      <Estado q={q}>
        <Tabla
          columnas={[['Nombre', 'clip', 'min-w-[260px]'], ['Tamaño', 'texto', 'min-w-[100px]'], ['Subido', 'calendario', 'min-w-[160px]'], ['', 'flecha', 'w-28']]}
          vacio="Este proyecto aún no tiene adjuntos."
          filas={items.map((a) => ({
            key: a.adjunto_id,
            celdas: [
              <span className="flex items-center gap-2 font-medium"><Icono n="pagina" className="h-4 w-4 text-tenue" /><span className="truncate">{a.nombre}</span></span>,
              <span className="text-suave">{bytes(a.tamano_bytes)}</span>,
              <span className="text-suave">{fecha(a.subido_en)}</span>,
              a.url_descarga ? <a href={a.url_descarga} target="_blank" rel="noreferrer" className="text-azul hover:underline">Descargar</a> : null,
            ],
          }))}
        />
      </Estado>
      <p className="mt-2 text-xs text-tenue">El archivo se sube directo a S3 con una URL temporal (5 minutos); el enlace de descarga también es temporal.</p>
    </div>
  )
}
