# ppm-frontend

Frontend del SaaS PPM: React + TypeScript + Vite + Tailwind. Es una SPA que llama a las 6 APIs.

## Correr en tu PC (VS Code)
1. Instala Node.js 20 o mas (https://nodejs.org), si no lo tienes.
2. Abre esta carpeta en VS Code y, en la terminal integrada:
   ```
   npm install
   copy .env.example .env      (Linux/Mac: cp .env.example .env)
   ```
3. Abre `.env` y pega las URLs de cada microservicio (las que imprime `serverless deploy`,
   sin "/" al final). Si aun no desplegaste, la pantalla abre pero el login dara error.
4. `npm run dev` y abre http://localhost:5173
5. Despues de cambiar `.env`, para y vuelve a correr `npm run dev`.

## Que incluye
- Login (organizacion + usuario + password). El tenant va en el token, el backend lo lee de ahi.
- Dashboard: tarjetas y graficos desde `POST /resumen/obtener`.
- Proyectos: vista Tabla (filtros, "Cargar mas" con last_key) y vista Kanban (arrastrar cambia el estado).
- Crear proyecto.
- Cada tenant tiene su color (src/lib/tenants.ts). La sesion vive en sessionStorage:
  cada pestana tiene su propia sesion, asi puedes tener ACM y ORACLE en dos pestanas.

## Estructura
- `src/lib/api.ts`: las 6 URLs, token en la cabecera `Authorization`, manejo de errores
  (el codigo real viene en `statusCode` dentro del JSON; 403 = vuelve al login).
- `src/lib/hooks.ts`: consultas (React Query). `src/pages`, `src/components`: pantallas.

## Desplegar en Amplify
Conecta el repo en Amplify Hosting. Build: `npm run build`, salida: `dist`.
Agrega las 6 variables VITE_API_* en Environment variables.
Rewrite para las rutas de la SPA (Hosting > Rewrites and redirects):
origen `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|ttf|map|json)$)([^.]+$)/>`,
destino `/index.html`, tipo `200 (Rewrite)`.

## Pantallas
Dashboard, Proyectos (tabla y tablero, con buscador por nombre y filtros de estado y portafolio combinables), detalle de proyecto
(tareas, presupuesto, recursos, adjuntos, prioridad), Tareas (todas las tareas del tenant), Portafolios, Recursos (filtro por rol,
quitar asignaciones), Presupuestos (todos los presupuestos del tenant), Priorizacion (pesos y ranking) y Usuarios (solo ADMIN).
