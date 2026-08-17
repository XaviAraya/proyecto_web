# Tech Solutions — Sistema de Gestión de Proyectos

Sistema web desarrollado bajo el patrón de arquitectura **MVC** con **Node.js**, **TypeScript**, **Express**, **Handlebars** y **Tailwind CSS**.

El proyecto integra gestión de proyectos, consulta de servicios externos en tiempo real (valor diario de la UF chilena) y un módulo seguro de autenticación sin estado mediante JSON Web Tokens (JWT) en cookies `httpOnly`.

---

## Tabla de Contenidos

- [Características Principales](#características-principales)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos Previos](#requisitos-previos)
- [Instalación y Configuración](#instalación-y-configuración)
- [Comandos Disponibles](#comandos-disponibles)
- [Guía de Uso Rápido](#guía-de-uso-rápido)
- [Consideraciones de Seguridad](#consideraciones-de-seguridad)
- [Licencia](#licencia)

---

## Características Principales

### 1. Módulo de Proyectos (CRUD)
- **Listar Proyectos:** Tabla interactiva con estados clasificados por colores (*pendiente*, *en curso*, *finalizado*), montos formateados en moneda nacional y acciones directas.
- **Crear Proyecto:** Formulario con asignación automática del usuario creador (`created_by`) derivado del token de sesión.
- **Detalle de Proyecto:** Información completa del proyecto, incluyendo el nombre del usuario responsable y del creador.
- **Editar y Eliminar:** Edición y borrado de proyectos mediante formularios HTML estándar utilizando `method-override` para los verbos HTTP `PUT` y `DELETE`.

### 2. Componente Reutilizable: Widget UF
- Consulta en tiempo real el valor diario de la Unidad de Fomento (UF) desde la API pública de [`mindicador.cl`](https://mindicador.cl).
- Componente de dos capas: servicio desacoplado (`uf.service.ts`) + vista reutilizable (`views/partials/uf-widget.hbs`).
- Manejo resiliente de errores ante caídas de red o falta de conexión.

### 3. Módulo de Autenticación y Seguridad
- **Registro y Login:** Formulario de registro con contraseñas cifradas unidireccionalmente mediante `bcryptjs` (salt rounds = 10).
- **Manejo de Sesión sin Estado:** Tokens JWT firmados almacenados en cookies seguras con atributo `httpOnly`.
- **Protección de Rutas:** Middleware `verificarToken` que resguarda todas las rutas bajo `/proyectos/*` y redirige a `/login` en caso de sesión inválida o ausente.
- **Protección contra enumeración de cuentas:** Respuestas de error genéricas en el login (`"Correo o clave incorrectos."`).

---

## Stack Tecnológico

| Capa / Herramienta | Tecnología / Paquete | Propósito |
|---|---|---|
| **Gestor de Paquetes** | [pnpm](https://pnpm.io/) | Instalación rápida, segura y sin dependencias fantasma. |
| **Lenguaje** | [TypeScript](https://www.typescriptlang.org/) (v5.x) | Tipado estático estricto y mantenibilidad. |
| **Backend / Framework** | [Express](https://expressjs.com/) (v5.x) | Enrutamiento, middlewares y controladores. |
| **Motor de Vistas** | [Express Handlebars](https://github.com/express-handlebars/express-handlebars) (v9.x) | Renderizado del lado del servidor (SSR) con plantillas `.hbs`. |
| **Estilos CSS** | [Tailwind CSS](https://tailwindcss.com/) (v3.4.x) + `@tailwindcss/forms` | Diseño responsivo utility-first y estilos de formulario. |
| **Seguridad** | `jsonwebtoken` & `bcryptjs` | Firma/verificación de JWT y hashing seguro de contraseñas. |
| **Cookies** | `cookie-parser` | Parseo y lectura de cookies `httpOnly`. |
| **Soporte HTTP Verbs** | `method-override` | Soporte de verbos `PUT` y `DELETE` desde formularios HTML. |
| **Entorno** | `dotenv` | Gestión de variables de entorno locales. |
| **ORM / Base de Datos** | [Prisma](https://www.prisma.io/) (v7.x) + **PostgreSQL** | Persistencia real de `Usuario` y `Proyecto`, migraciones versionadas en `prisma/migrations`. |
| **Contenedores** | Docker + Docker Compose | Servicios `app` (Node) y `db` (PostgreSQL) orquestados con `docker-compose.yml`. |
| **Interactividad Cliente** | [Alpine.js](https://alpinejs.dev/) (v3.x) | Auto-hospedado (`public/js/alpine.min.js`, vendorizado por `pnpm build:js`, sin CDN). Solo para menú móvil y alertas auto-descartables. |

### ¿Por qué este stack?

Es un stack coherente para un CRUD con autenticación: Express + Handlebars (SSR) evita la complejidad de un frontend SPA, TypeScript da seguridad de tipos, y Prisma + PostgreSQL + Docker aportan persistencia real y un entorno reproducible con un solo comando — piezas maduras y bien documentadas, sin nada exótico.

**Trade-off principal:** al ser SSR con Handlebars, cada acción (crear, editar, eliminar) recarga la página completa; no hay actualizaciones parciales sin JavaScript adicional. Para el alcance de este proyecto (CRUD + auth) es una ventaja de simplicidad, no una limitación. Para el puñado de interacciones que sí lo pedían (menú móvil responsivo, alertas que se auto-cierran) se sumó Alpine.js de forma mínima en vez de saltar a un framework SPA completo.

---

## Estructura del Proyecto

```text
proyecto_web/
├── Dockerfile                   # Imagen de la app: install → prisma generate → build → migrate deploy + start
├── docker-compose.yml           # Servicios `app` (Node) y `db` (postgres:16-alpine)
├── prisma/
│   ├── schema.prisma            # Modelos Usuario y Proyecto (Prisma ORM)
│   └── migrations/              # Historial de migraciones SQL versionado
├── public/
│   ├── css/
│   │   └── styles.css          # CSS compilado por Tailwind (generado)
│   └── js/
│       └── alpine.min.js       # Alpine.js vendorizado por `pnpm build:js` (generado)
├── dist/                       # Salida compilada a JavaScript para producción
├── src/
│   ├── config/
│   │   └── db.ts               # Instancia única de PrismaClient (driver adapter @prisma/adapter-pg)
│   ├── generated/
│   │   └── prisma/             # Cliente de Prisma generado (gitignored)
│   ├── controllers/
│   │   ├── auth.controller.ts  # Controladores de registro, login y logout
│   │   └── proyecto.controller.ts # Controladores del CRUD de proyectos
│   ├── middlewares/
│   │   └── auth.middleware.ts  # verificarToken (protege rutas) + cargarUsuario (sesión disponible en las vistas)
│   ├── models/
│   │   ├── usuario.model.ts    # CRUD async sobre `prisma.usuario`
│   │   └── proyecto.model.ts   # CRUD async sobre `prisma.proyecto`
│   ├── routes/
│   │   ├── auth.routes.ts      # Rutas públicas (/registro, /login, /logout)
│   │   └── proyecto.routes.ts  # Rutas protegidas (/proyectos/*)
│   ├── services/
│   │   └── uf.service.ts       # Servicio que consume la API de mindicador.cl
│   ├── styles/
│   │   └── input.css           # Tailwind + @layer components (.btn-primary, .card, .badge, .input-field...)
│   ├── types/
│   │   ├── usuario.d.ts        # Interface IUsuario
│   │   ├── proyecto.d.ts       # Interface IProyecto
│   │   └── express.d.ts        # Extensión de tipos de Express.Request con usuario
│   ├── views/
│   │   ├── layouts/
│   │   │   └── main.hbs        # Layout principal: header con nav responsivo (menú móvil vía Alpine.js) y footer
│   │   ├── partials/
│   │   │   ├── uf-widget.hbs   # Widget que muestra el valor de la UF
│   │   │   └── alert.hbs       # Alerta de error/éxito reutilizable, auto-descartable
│   │   ├── auth/
│   │   │   ├── login.hbs       # Vista de inicio de sesión
│   │   │   └── registro.hbs    # Vista de registro de usuarios
│   │   └── proyectos/
│   │       ├── listar.hbs      # Tabla de proyectos + widget UF + botón crear
│   │       ├── crear.hbs       # Formulario para nuevo proyecto
│   │       ├── detalle.hbs     # Vista detallada de proyecto
│   │       ├── editar.hbs      # Formulario de edición (vía PUT)
│   │       └── eliminar.hbs    # Confirmación de borrado (vía DELETE)
│   ├── app.ts                  # Configuración de Express, Handlebars y Middlewares
│   └── server.ts               # Punto de entrada para levantar el servidor
├── .env.example                # Plantilla de variables de entorno
├── tailwind.config.js          # Configuración de Tailwind CSS
├── postcss.config.js           # Plugins de PostCSS (Tailwind + Autoprefixer)
├── tsconfig.json               # Configuración del compilador TypeScript
├── AGENTS.md                   # Guía de contexto y restricciones para agentes IA
└── package.json                # Scripts y dependencias del proyecto
```

---

## Requisitos Previos

- **Node.js:** Versión 18 o superior (recomendado Node.js 20 LTS) — solo si se ejecuta fuera de Docker.
- **pnpm:** Versión 9 o superior (`npm install -g pnpm`) — solo si se ejecuta fuera de Docker.
- **Docker + Docker Compose:** Forma recomendada de correr la aplicación completa (app + PostgreSQL) sin instalar nada más.

---

## Instalación y Configuración

### Opción A: Con Docker (recomendada)

1. **Ingresar al directorio del proyecto y configurar las variables de entorno:**
   ```bash
   cd proyecto_web
   cp .env.example .env
   ```

   El `.env` contendrá:
   ```env
   DATABASE_URL="postgresql://postgres:desarrollo_software_1@localhost:5432/desarrollo_software_1?schema=public"
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=desarrollo_software_1
   POSTGRES_DB=desarrollo_software_1
   JWT_SECRET=definir_una_clave_secreta_fuerte
   JWT_EXPIRES_IN=1h
   UF_API_URL=https://mindicador.cl/api/uf
   PORT=3000
   ```

2. **Levantar la app y PostgreSQL con un solo comando:**
   ```bash
   docker compose up -d --build
   ```
   El contenedor `app` aplica automáticamente las migraciones (`prisma migrate deploy`) antes de arrancar el servidor. La app queda disponible en [`http://localhost:3000`](http://localhost:3000).

### Opción B: Local (sin Docker)

1. **Instalar las dependencias con `pnpm`:**
   ```bash
   pnpm install
   ```

2. **Configurar `.env`** (como en la Opción A), apuntando `DATABASE_URL` a un PostgreSQL accesible (por ejemplo, levantando solo la base con `docker compose up -d db`).

3. **Aplicar las migraciones:**
   ```bash
   npx prisma migrate deploy
   ```

4. **Levantar el servidor de desarrollo:**
   ```bash
   pnpm dev
   ```

---

## Comandos Disponibles

| Comando | Descripción |
|---|---|
| `pnpm dev` | Levanta el servidor con **recarga automática** (`ts-node-dev`) y el compilador de Tailwind en modo **watch** en paralelo. |
| `pnpm dev:server` | Inicia únicamente el servidor Express en modo desarrollo. |
| `pnpm dev:css` | Inicia únicamente el watcher de Tailwind CSS. |
| `pnpm build:css` | Compila y minifica el archivo CSS para producción. |
| `pnpm build:js` | Vendoriza Alpine.js a `public/js/alpine.min.js` (corre sola al inicio de `dev`/`build`). |
| `pnpm build` | Compila CSS, transpila TypeScript a `dist/` y copia las plantillas `.hbs` a `dist/views`. |
| `pnpm start` | Inicia la aplicación en **modo producción** desde `dist/server.js`. |
| `pnpm exec tsc --noEmit` | Ejecuta el chequeo estático de tipos sin compilar archivos. |
| `npx prisma migrate dev --name <nombre>` | Crea y aplica una nueva migración en desarrollo. |
| `npx prisma migrate deploy` | Aplica migraciones pendientes sin generar nuevas (usado en el arranque del contenedor). |
| `npx prisma generate` | Regenera el cliente de Prisma tras cambiar `schema.prisma`. |
| `docker compose up -d --build` | Construye y levanta la app + PostgreSQL completos. |
| `docker compose logs -f app` | Sigue los logs del servidor dentro del contenedor. |
| `docker compose down` | Detiene los contenedores (los datos persisten en el volumen `pgdata`). |

---

## Guía de Uso Rápido

> **Nota sobre persistencia:** Los datos se almacenan en PostgreSQL vía Prisma ORM, no en memoria.

1. **Iniciar el entorno (con Docker):**
   ```bash
   docker compose up -d --build
   ```
   O en modo desarrollo local: `pnpm dev` (requiere `DATABASE_URL` apuntando a una DB accesible).
2. **Abrir en el navegador:**
   Ingresa a [`http://localhost:3000`](http://localhost:3000). El sistema te redirigirá a `/proyectos` y luego a `/login` al no detectar una sesión activa.
3. **Crear una cuenta:**
   - Haz clic en **Regístrate** o ingresa a [`http://localhost:3000/registro`](http://localhost:3000/registro).
   - Completa el formulario (ej. Nombre: `Javier`, Correo: `javier@test.cl`, Clave: `123456`).
4. **Iniciar sesión:**
   - Ve a [`http://localhost:3000/login`](http://localhost:3000/login) e ingresa con tus credenciales.
5. **Gestionar Proyectos:**
   - Podrás crear nuevos proyectos, ver el detalle completo con el nombre del creador asignado automáticamente, editar sus campos o eliminarlos.
   - En la cabecera del listado observarás el valor del día de la UF consultado automáticamente.

---

## Consideraciones de Seguridad

- **Protección de Credenciales:** La contraseña ingresada nunca se almacena en texto plano; se cifra con un hash seguro de `bcrypt`. Tampoco se envía ni renderiza en ninguna vista o respuesta.
- **Cookies Seguras (`httpOnly`):** El token JWT reside en una cookie inaccesible para scripts del lado del cliente (`document.cookie`), protegiendo la sesión ante ataques XSS.
- **Asignación Segura de `created_by`:** El ID del creador se extrae exclusivamente del JWT verificado en el backend, imposibilitando la suplantación de identidad en formularios.
- **Manejo de Errores Genéricos:** Los intentos fallidos de inicio de sesión devuelven mensajes genéricos para evitar la enumeración de usuarios.

---

## Licencia

Proyecto académico desarrollado para **Tech Solutions**.
