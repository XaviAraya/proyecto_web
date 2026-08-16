# BRIEF.md

## Proyecto
Sistema de gestión de proyectos para **Tech Solutions**, construido con Node.js, TypeScript y Express siguiendo el patrón **MVC**. El proyecto se arma en dos unidades que se integran en un mismo sistema:

- **Unidad 1** (base): CRUD completo de `Proyecto` (rutas, controladores, modelo con datos estáticos, vistas) + un componente reutilizable que consulta el valor del día de la UF (Unidad de Fomento) desde un servicio externo.
- **Unidad 2** (capa de autenticación): registro e inicio de sesión de `Usuario` con clave cifrada y JWT, más un middleware que protege las rutas de proyectos usando ese JWT. El campo `created_by` de `Proyecto` pasa a ser el id del usuario autenticado que crea el proyecto — este es el punto de integración entre ambas unidades.

Etapa: proyecto académico. Los modelos usan **datos estáticos en memoria** (arrays tipados), no hay conexión real a base de datos todavía.

## Stack técnico
- Gestor de paquetes: **pnpm** — se elige por sobre npm por seguridad: usa un store de contenido con hashes verificados, `node_modules` con estructura estricta (evita el acceso a "dependencias fantasma" no declaradas en `package.json`), e instalación determinística vía `pnpm-lock.yaml`
- Node.js + **TypeScript**
- Framework: **Express.js**
- Patrón: **MVC** (Model - View - Controller), con capas adicionales de `routes`, `middlewares` y `services`
- Motor de vistas: **Handlebars** (`express-handlebars`), archivos `.hbs`
- Estilos: **Tailwind CSS** (utility-first), compilado a `public/css/styles.css`
- Autenticación: JWT (`jsonwebtoken`)
- Cifrado de contraseñas: `bcryptjs`
- Sesión vía cookie: `cookie-parser` (ver nota en Middleware)
- Formularios HTML con verbos PUT/DELETE: `method-override`
- Variables de entorno: `dotenv`
- Llamada al servicio externo de UF: `fetch` nativo (Node 18+) o `axios`
- **Nota:** las variables de BD se configuran igual, para preparar la futura conexión real, pero por ahora los modelos son arrays estáticos, sin ORM ni queries reales.

## Estructura del proyecto (MVC)
```
project-root/
├── src/
│   ├── config/
│   │   └── db.ts                    # config de conexión (placeholder, no se usa aún)
│   ├── models/                      # M
│   │   ├── usuario.model.ts
│   │   └── proyecto.model.ts
│   ├── views/                       # V
│   │   ├── layouts/
│   │   │   └── main.hbs             # layout base (header/nav/footer)
│   │   ├── partials/
│   │   │   └── uf-widget.hbs        # componente reutilizable, muestra la UF
│   │   ├── auth/
│   │   │   ├── login.hbs
│   │   │   └── registro.hbs
│   │   └── proyectos/
│   │       ├── listar.hbs
│   │       ├── crear.hbs
│   │       ├── detalle.hbs
│   │       ├── editar.hbs
│   │       └── eliminar.hbs
│   ├── controllers/                 # C
│   │   ├── auth.controller.ts
│   │   └── proyecto.controller.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   └── proyecto.routes.ts
│   ├── middlewares/
│   │   └── auth.middleware.ts
│   ├── services/
│   │   └── uf.service.ts
│   ├── styles/
│   │   └── input.css                # entrada de Tailwind (@tailwind base/components/utilities)
│   ├── types/
│   │   ├── usuario.d.ts             # interface IUsuario
│   │   ├── proyecto.d.ts            # interface IProyecto
│   │   └── express.d.ts             # extiende Request con `usuario`
│   ├── app.ts                       # configura Express, handlebars, middlewares globales, rutas
│   └── server.ts                    # levanta el servidor (app.listen)
├── public/
│   └── css/
│       └── styles.css               # CSS generado por Tailwind — no editar a mano
├── dist/                            # output compilado por tsc (no versionar)
├── .env
├── .env.example
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
└── .npmrc                           # opcional: fija strict-peer-dependencies, etc.
```
Antes de generar código nuevo, revisar el esqueleto ya existente de Unidad 1 y respetar su estructura/nombres si difieren de lo anterior.

## Configuración TypeScript
- `tsconfig.json` sugerido: `target: ES2020`, `module: CommonJS`, `rootDir: src`, `outDir: dist`, `strict: true`, `esModuleInterop: true`, `resolveJsonModule: true`.
- Extender el tipo `Request` de Express (`src/types/express.d.ts`) para agregar `usuario?: JwtPayload` — necesario porque el middleware adjunta el usuario decodificado a `req.usuario`.
- Definir interfaces `IUsuario` e `IProyecto` en `src/types/` y usarlas para tipar los arrays estáticos de los modelos y los `req.body` de los controladores.

## Configuración de Tailwind
- `tailwind.config.js`: en `content`, escanear `./src/views/**/*.hbs` (todas las vistas, layouts y partials) para que Tailwind detecte las clases usadas.
- `postcss.config.js`: plugins `tailwindcss` y `autoprefixer`.
- `src/styles/input.css` contiene las directivas `@tailwind base; @tailwind components; @tailwind utilities;` y es el archivo de entrada del build.
- El CLI de Tailwind compila `src/styles/input.css` → `public/css/styles.css`, que es el único CSS que se referencia desde `layouts/main.hbs` (`<link rel="stylesheet" href="/css/styles.css">`).
- Opcional: agregar el plugin `@tailwindcss/forms` para que los formularios (login, registro, crear/editar proyecto) tengan un estilo base más prolijo sin escribir CSS custom.

## Rutas a implementar

### Autenticación (públicas)
| Método | Ruta      | Descripción                              | Vista        |
|--------|-----------|-------------------------------------------|--------------|
| GET    | /registro | Formulario de registro                    | auth/registro.hbs |
| POST   | /registro | Procesa el registro                       | auth/registro.hbs |
| GET    | /login    | Formulario de inicio de sesión            | auth/login.hbs    |
| POST   | /login    | Procesa el login, genera JWT y lo guarda en cookie | redirige a /proyectos |
| GET    | /logout   | Limpia la cookie del token                | redirige a /login |

### Proyectos (protegidas por `verificarToken`)
| Método | Ruta                  | Descripción                          | Controlador                    | Vista              |
|--------|-----------------------|----------------------------------------|---------------------------------|--------------------|
| GET    | /proyectos            | Listar todos los proyectos             | `listarProyectos`               | proyectos/listar.hbs |
| GET    | /proyectos/nuevo      | Formulario para crear proyecto         | —                                | proyectos/crear.hbs |
| POST   | /proyectos            | Crear proyecto (`created_by` = usuario del JWT) | `crearProyecto`      | redirige a /proyectos |
| GET    | /proyectos/:id        | Obtener un proyecto por id             | `obtenerProyectoPorId`          | proyectos/detalle.hbs |
| GET    | /proyectos/:id/editar | Formulario para actualizar proyecto    | —                                | proyectos/editar.hbs |
| PUT    | /proyectos/:id        | Actualizar proyecto por id (vía `method-override`) | `actualizarProyecto` | redirige a /proyectos/:id |
| GET    | /proyectos/:id/eliminar | Vista de confirmación de borrado     | —                                | proyectos/eliminar.hbs |
| DELETE | /proyectos/:id        | Eliminar proyecto por id (vía `method-override`) | `eliminarProyecto`   | redirige a /proyectos |

Todas las rutas de `/proyectos/*` pasan primero por `verificarToken`. Si no hay sesión válida, redirigir a `/login` (no simplemente devolver 401 en crudo, ya que son vistas navegadas por el usuario en el navegador).

## Controladores

### Autenticación (`controllers/auth.controller.ts`)
**`registrarUsuario(req: Request, res: Response)`**
- Recibe `nombre`, `correo`, `clave`.
- Valida que `correo` no exista ya en el array de `Usuario` (identificador único).
- Cifra `clave` con `bcryptjs` antes de guardar — nunca texto plano.
- Agrega el usuario al array estático tipado como `IUsuario[]`.
- Renderiza la vista con mensaje de éxito, o de error si el correo ya está registrado.

**`iniciarSesion(req: Request, res: Response)`**
- Recibe `correo` y `clave`.
- Busca el usuario por `correo`.
- Compara `clave` contra el hash con `bcrypt.compare`.
- Si es válido: genera un JWT (payload `{ id, correo }`) firmado con `process.env.JWT_SECRET`, expiración `process.env.JWT_EXPIRES_IN`, lo guarda en una cookie httpOnly (`token`) y redirige a `/proyectos`.
- Si no es válido: renderiza login con mensaje de error genérico (no indicar si falló el correo o la clave).

**`cerrarSesion(req: Request, res: Response)`** *(opcional pero recomendado ya que ahora hay vistas protegidas)*
- Limpia la cookie `token` y redirige a `/login`.

### Proyectos (`controllers/proyecto.controller.ts`)
**`crearProyecto(req: Request, res: Response)`**
- Recibe `nombre`, `fecha_inicio`, `estado`, `responsable`, `monto` del formulario.
- Asigna `created_by = req.usuario!.id` (viene del middleware, no del formulario).
- Agrega el proyecto al array estático tipado `IProyecto[]` con un id autoincremental simulado.
- Redirige a `/proyectos`.

**`listarProyectos(req: Request, res: Response)`**
- Renderiza `proyectos/listar.hbs` con todos los proyectos del array estático.
- Opcionalmente incluye el valor de la UF del día (vía `uf.service.ts`) para mostrarlo en la cabecera de la vista.

**`obtenerProyectoPorId(req: Request, res: Response)`**
- Busca el proyecto por `id` (parámetro de ruta).
- Si no existe → renderiza un estado 404 o redirige a `/proyectos` con mensaje de error.
- Si existe → renderiza `proyectos/detalle.hbs` con sus datos.

**`actualizarProyecto(req: Request, res: Response)`**
- Busca el proyecto por `id`, actualiza los campos recibidos del formulario (no permite cambiar `created_by`).
- Redirige a `/proyectos/:id`.

**`eliminarProyecto(req: Request, res: Response)`**
- Busca el proyecto por `id` y lo remueve del array estático.
- Redirige a `/proyectos`.

## Middleware de autenticación (`middlewares/auth.middleware.ts`)
- Función `verificarToken(req: Request, res: Response, next: NextFunction)`.
- Como las vistas de proyectos se navegan directamente en el navegador (no son llamadas `fetch` con headers custom), el JWT se lee **desde la cookie** `token` (usando `cookie-parser`), no desde el header `Authorization`. Si además se quiere probar la API con Postman, aceptar también `Authorization: Bearer <token>` como fallback.
- Sin token → redirige a `/login`.
- Token inválido o expirado → limpia la cookie y redirige a `/login`.
- Token válido → decodifica el payload (tipado como `JwtPayload` desde `types/express.d.ts`), lo adjunta a `req.usuario`, llama a `next()`.
- Se aplica a todas las rutas bajo `/proyectos`.

## Componente reutilizable: valor de la UF del día (`services/uf.service.ts`)
- Función `obtenerUF(): Promise<{ fecha: string; valor: number }>` que consulta un servicio externo.
- Servicio sugerido: **mindicador.cl** (API pública chilena, sin API key) → `GET https://mindicador.cl/api/uf`.
- Debe manejar el caso de falla de red o servicio caído (try/catch, valor de respaldo o mensaje "UF no disponible").
- Se expone como **componente reutilizable de dos capas**:
  1. Servicio (`services/uf.service.ts`) — lógica de fetch tipada, puede llamarse desde cualquier controlador.
  2. Partial de Handlebars (`views/partials/uf-widget.hbs`) — recibe `{ uf }`, se estiliza con clases de Tailwind (ej. una tarjeta pequeña tipo badge), y se incluye donde se necesite con `{{> uf-widget uf=uf}}` (por ejemplo, en `proyectos/listar.hbs`).
- La URL del servicio se puede parametrizar en `.env` (`UF_API_URL`) para no dejarla hardcodeada.

## Handlebars: notas de configuración
- Registrar `express-handlebars` en `app.ts` con `defaultLayout: 'main'` y `extname: '.hbs'`.
- Handlebars es "logic-less": si se necesita comparar valores en la vista (ej. resaltar `estado` según su valor, formatear `fecha_inicio` o `monto` como moneda), crear **helpers personalizados** registrados en la config de `express-handlebars` (ej. `eq`, `formatFecha`, `formatMonto`) en vez de meter lógica en el `.hbs`.
- Los partials dentro de `views/partials/` se registran automáticamente y están disponibles en cualquier vista sin `include` explícito (a diferencia de EJS).
- Todo el marcado dentro de los `.hbs` se estiliza con clases utilitarias de Tailwind directamente en el HTML (sin CSS custom salvo casos puntuales).

## Modelos (datos estáticos, tipados)

### Usuario (`models/usuario.model.ts`, usa `IUsuario` de `types/usuario.d.ts`)
| Campo  | Tipo   | Notas |
|--------|--------|-------|
| id     | number | autoincremental simulado |
| nombre | string | |
| correo | string | identificador único, validar duplicados |
| clave  | string | se guarda cifrada (hash bcrypt), nunca texto plano |

### Proyecto (`models/proyecto.model.ts`, usa `IProyecto` de `types/proyecto.d.ts`)
| Campo         | Tipo   | Notas |
|---------------|--------|-------|
| id            | number | autoincremental simulado |
| nombre        | string | |
| fecha_inicio  | string | formato ISO `YYYY-MM-DD` |
| estado        | string | ej: "pendiente", "en curso", "finalizado" |
| responsable   | string | |
| monto         | number | |
| created_by    | number | id del `Usuario` autenticado que lo creó (asignado por el controlador, no editable por el formulario) |

## Variables de entorno (`.env`)
```
DB_NAME=desarrollo_software_1
DB_USER=root
DB_PASSWORD=desarrollo_software_1
DB_HOST=localhost
DB_PORT=3306
JWT_SECRET=definir_una_clave_secreta_fuerte
JWT_EXPIRES_IN=1h
UF_API_URL=https://mindicador.cl/api/uf
PORT=3000
```
Crear también `.env.example` con las mismas claves sin valores sensibles, y agregar `.env` y `dist/` a `.gitignore`.

## Vistas
- **auth/login.hbs / auth/registro.hbs**: formularios con sus campos correspondientes, zona para mensajes de error/éxito, estilos con clases utilitarias de Tailwind.
- **proyectos/listar.hbs**: tabla con todos los proyectos, botones/links a detalle, editar y eliminar; incluye el partial `uf-widget`.
- **proyectos/crear.hbs**: formulario con `nombre`, `fecha_inicio`, `estado`, `responsable`, `monto` (sin `created_by`, se asigna automático).
- **proyectos/detalle.hbs**: muestra todos los campos de un proyecto, incluido quién lo creó.
- **proyectos/editar.hbs**: formulario precargado con los datos actuales del proyecto.
- **proyectos/eliminar.hbs**: vista de confirmación ("¿Seguro que deseas eliminar [nombre]?") con botón que dispara el `DELETE`.
- **partials/uf-widget.hbs**: componente reutilizable, muestra fecha y valor de la UF.
- **layouts/main.hbs**: layout base que envuelve todas las vistas (header/nav/footer comunes), incluye el `<link>` a `public/css/styles.css`.

## Dependencias sugeridas (`package.json`)
- **Runtime** (`pnpm add ...`): `express`, `express-handlebars`, `bcryptjs`, `jsonwebtoken`, `cookie-parser`, `method-override`, `dotenv`
- **Dev** (`pnpm add -D ...`): `typescript`, `ts-node-dev` (o `ts-node` + `nodemon`), `tailwindcss`, `postcss`, `autoprefixer`, `concurrently` (para correr el server y el watch de Tailwind en paralelo), `@types/node`, `@types/express`, `@types/bcryptjs`, `@types/jsonwebtoken`, `@types/cookie-parser`, `@types/method-override`

## Convenciones
- Archivos por capa MVC con sufijo descriptivo: `*.model.ts`, `*.controller.ts`, `*.routes.ts`, `*.middleware.ts`, `*.service.ts`.
- Interfaces con prefijo `I` (`IUsuario`, `IProyecto`), definidas en `src/types/`.
- Nunca loguear ni devolver `clave` (ni cifrada) en ninguna respuesta o vista.
- Mensajes de error de login genéricos (no revelar si falló el correo o la clave).
- `created_by` siempre se asigna en el controlador desde `req.usuario.id`, nunca se confía en un valor enviado por el formulario.
- Evitar lógica de negocio dentro de las vistas `.hbs`; toda decisión (formatos, condicionales complejos) va en el controlador o en un helper de Handlebars.
- Estilos siempre con clases utilitarias de Tailwind en el markup; no agregar CSS custom salvo excepción justificada, y nunca editar `public/css/styles.css` a mano (es generado).
- Mantener consistencia con las convenciones ya usadas en el esqueleto de Unidad 1.
- Usar siempre **pnpm** para instalar y correr scripts; no mezclar con `npm`/`yarn` (evita lockfiles duplicados e inconsistencias en el árbol de dependencias).

## Comandos
- `pnpm install` — instalar dependencias
- `pnpm dev` — levanta server (`ts-node-dev`) y el watch de Tailwind en paralelo (`concurrently`)
- `pnpm dev:server` — solo el servidor en modo desarrollo
- `pnpm dev:css` — solo el watch de Tailwind (`tailwindcss -i ./src/styles/input.css -o ./public/css/styles.css --watch`)
- `pnpm build:css` — compila y minifica el CSS de Tailwind para producción
- `pnpm build` — `build:css` + compila TypeScript a `dist/` (`tsc`)
- `pnpm start` — levanta en producción (`node dist/server.js`)

## Fuera de alcance por ahora
- Conexión real a MySQL (modelos estáticos por el momento).
- Recuperación de contraseña, roles de usuario, refresh tokens.
- Paginación o filtros avanzados en el listado de proyectos.
