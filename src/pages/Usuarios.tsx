import { useState } from 'react'
import { useAuth } from '../lib/auth'
import { useCrearUsuario } from '../lib/servicios'
import { nombreDeTenant } from '../lib/tenants'
import { BotonPrimario, Callout, Campo, Encabezado, ErrorMsg, entrada } from '../components/ui'
import { Tabla } from '../components/comunes'

const ROLES = ['ADMIN', 'GERENTE', 'MIEMBRO']

export default function Usuarios() {
  const { sesion } = useAuth()
  const crear = useCrearUsuario()
  const [f, setF] = useState({ usuario_id: '', password: '', rol: 'MIEMBRO' })
  const [creados, setCreados] = useState<{ usuario_id: string; rol: string }[]>([])
  const tenant = nombreDeTenant(sesion?.tenant_id ?? '')

  return (
    <div>
      <Encabezado icono="👤" titulo="Usuarios" descripcion={`Crea usuarios para la organización ${tenant}.`} />
      {sesion?.rol !== 'ADMIN' ? (
        <Callout icono="🔒" tono="rojo">Solo un usuario con rol ADMIN puede crear usuarios.</Callout>
      ) : (
        <div className="max-w-md">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              crear.mutate(f, {
                onSuccess: (r) => {
                  setCreados((c) => [{ usuario_id: r.usuario_id ?? f.usuario_id, rol: r.rol ?? f.rol }, ...c])
                  setF({ usuario_id: '', password: '', rol: 'MIEMBRO' })
                },
              })
            }}
          >
            <Campo etiqueta="Usuario"><input className={entrada} value={f.usuario_id} onChange={(e) => setF({ ...f, usuario_id: e.target.value })} placeholder="nombre.usuario" autoComplete="off" /></Campo>
            <Campo etiqueta="Contraseña"><input type="password" className={entrada} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete="new-password" /></Campo>
            <Campo etiqueta="Rol">
              <select className={entrada} value={f.rol} onChange={(e) => setF({ ...f, rol: e.target.value })}>
                {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>)}
              </select>
            </Campo>
            {crear.error ? <div className="mb-4"><ErrorMsg error={crear.error} /></div> : null}
            <BotonPrimario type="submit" disabled={!f.usuario_id.trim() || !f.password || crear.isPending}>
              {crear.isPending ? 'Creando…' : 'Crear usuario'}
            </BotonPrimario>
          </form>
          <p className="mt-3 text-xs text-tenue">El usuario se crea siempre en tu organización: el tenant lo toma el servidor de tu sesión.</p>

          {creados.length ? (
            <div className="mt-8">
              <h2 className="mb-2 text-xs font-medium text-suave">Creados en esta sesión</h2>
              <Tabla
                columnas={[['Usuario', 'usuario', 'min-w-[200px]'], ['Rol', 'bandera', 'min-w-[100px]']]}
                filas={creados.map((c) => ({ key: c.usuario_id, celdas: [<span className="font-medium">{c.usuario_id}</span>, <span className="text-suave">{c.rol}</span>] }))}
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
