# Contexto y Guía del Proyecto para Agentes de IA (`AGENTS.md`)

Este documento consolida la arquitectura, convenciones, lecciones aprendidas, restricciones y comandos de operación para cualquier agente de IA que trabaje en este repositorio.

---

## 📌 1. Visión General del Proyecto

Sistema MVC de **Gestión de Proyectos** para la empresa **Tech Solutions**, desarrollado con Node.js, TypeScript, Express, Handlebars y Tailwind CSS.

El sistema integra dos componentes funcionales principales:
1. **Módulo de Proyectos (CRUD + Servicio Externo)**: Gestión de proyectos (listar, crear, ver detalle, editar, eliminar) y visualización del valor diario de la UF chilena consultada desde una API externa (`mindicador.cl`).
2. **Módulo de Autenticación y Seguridad (JWT en Cookie)**: Registro e inicio de sesión de usuarios con contraseñas cifradas (`bcryptjs`), autenticación sin estado mediante JWT en cookies `httpOnly`, middleware de protección de rutas y vinculación automática del creador del proyecto (`created_by`).

> **Nota sobre persistencia:** Los datos se persisten en **PostgreSQL** vía **Prisma ORM** (`prisma/schema.prisma`, cliente instanciado en `src/config/db.ts`). Toda la aplicación (servidor Node + base de datos) corre en **Docker** mediante `docker-compose.yml`.

---

## 🛠 2. Stack Técnico y Dependencias

| Capa / Herramienta | Tecnología / Paquete | Notas Clave |
|---|---|---|
| **Gestor de Paquetes** | `pnpm` | **Exclusivo**: Nunca usar `npm` ni `yarn` para evitar duplicación de lockfiles. |
| **Lenguaje** | `TypeScript` (v5.x) | `strict: true`, CommonJS, ES2020. |
| **Backend / Framework** | `Express` (v5.x) | Arquitectura multicapa: Rutas → Middlewares → Controladores → Modelos/Servicios. |
| **Motor de Vistas** | `express-handlebars` (v9.x) | Server-side rendering con layout base y partials. |
| **Estilos** | `Tailwind CSS` (v3.4.x) + `@tailwindcss/forms` | Compilado vía PostCSS a `public/css/styles.css`. |
| **Seguridad & Auth** | `jsonwebtoken`, `bcryptjs`, `cookie-parser` | JWT firmado con `JWT_SECRET`, cookies `httpOnly`. |
| **Verbos HTTP en Formularios**| `method-override` | Soporta `PUT` y `DELETE` desde formularios HTML. |
| **Variables de Entorno** | `dotenv` | Configuradas en `.env` (ignorado en git), plantilla en `.env.example`. |
| **ORM / Base de Datos** | `Prisma` (v7.x) + `PostgreSQL` | Cliente generado en `src/generated/prisma` (gitignored). Prisma 7 usa **driver adapters**: `@prisma/adapter-pg` + `pg`, no lee `DATABASE_URL` automáticamente. |
| **Contenedores** | `Docker` + `docker compose` | `Dockerfile` (imagen de la app) + `docker-compose.yml` (servicios `app` y `db`). |

---

## 📂 3. Estructura de Directorios

```text
/home/javieraraya/proyecto_web/
├── .env                       # Variables de entorno locales (puerto, JWT secret, DATABASE_URL, URL UF)
├── .env.example               # Plantilla de variables sin secretos
├── .gitignore                 # Ignora node_modules/, dist/, .env, src/generated/prisma
├── .dockerignore               # Excluye node_modules/, dist/, src/generated, .git, .env de la imagen
├── Dockerfile                 # Imagen de la app: install → prisma generate → build → migrate deploy + start
├── docker-compose.yml         # Servicios `app` (Node) y `db` (postgres:16-alpine)
├── package.json               # Scripts y dependencias
├── tsconfig.json              # Configuración TypeScript (CommonJS, strict)
├── tailwind.config.js         # Configuración Tailwind (content en views/**/*.hbs)
├── postcss.config.js          # Plugins: tailwindcss, autoprefixer
├── prisma/
│   ├── schema.prisma          # Modelos Usuario y Proyecto, generator con driver adapters
│   └── migrations/            # Historial de migraciones SQL (versionado en git)
├── prisma.config.ts           # Config del CLI de Prisma (lee DATABASE_URL vía dotenv)
├── Docs/
│   └── BRIEF.md               # Especificación funcional y de negocio original
├── PLAN.md                    # Plan de implementación paso a paso verificado
├── AGENTS.md                  # Este documento de contexto para agentes
├── public/
│   └── css/
│       └── styles.css         # CSS compilado por Tailwind (NO editar manualmente)
├── dist/                      # Código compilado a JS y vistas para producción (generado)
└── src/
    ├── app.ts                 # Configuración de Express, Handlebars, Middlewares y Rutas
    ├── server.ts              # Entry point para levantar el servidor (app.listen)
    ├── config/
    │   └── db.ts              # Instancia única de PrismaClient (con adapter @prisma/adapter-pg)
    ├── generated/
    │   └── prisma/            # Cliente de Prisma generado (gitignored, se regenera con `prisma generate`)
    ├── types/
    │   ├── usuario.d.ts       # Interface IUsuario
    │   ├── proyecto.d.ts      # Interface IProyecto
    │   └── express.d.ts       # Extensión de Express.Request con usuario?: JwtPayload
    ├── models/
    │   ├── usuario.model.ts   # CRUD async sobre `prisma.usuario`
    │   └── proyecto.model.ts  # CRUD async sobre `prisma.proyecto`
    ├── middlewares/
    │   └── auth.middleware.ts # verificarToken: valida JWT en cookie o header Bearer
    ├── services/
    │   └── uf.service.ts      # Servicio tipado para consultar mindicador.cl/api/uf
    ├── controllers/
    │   ├── auth.controller.ts # Lógica de login, registro y logout
    │   └── proyecto.controller.ts # Lógica de CRUD de proyectos
    ├── routes/
    │   ├── auth.routes.ts     # /registro, /login, /logout
    │   └── proyecto.routes.ts # /proyectos, /proyectos/nuevo, /proyectos/:id, etc.
    ├── styles/
    │   └── input.css          # Directivas @tailwind base, components, utilities
    └── views/
        ├── layouts/
        │   └── main.hbs       # Layout base HTML5 con header, nav y footer
        ├── partials/
        │   └── uf-widget.hbs  # Widget badge que renderiza el valor de la UF
        ├── auth/
        │   ├── login.hbs      # Formulario de inicio de sesión
        │   └── registro.hbs   # Formulario de registro
        └── proyectos/
            ├── listar.hbs     # Tabla de proyectos + widget UF + botón crear
            ├── crear.hbs      # Formulario para nuevo proyecto
            ├── detalle.hbs    # Vista de detalle con responsable y creador
            ├── editar.hbs     # Formulario de edición (vía PUT)
            └── eliminar.hbs   # Confirmación de borrado (vía DELETE)
```

---

## 🔒 4. Reglas de Seguridad y Convenciones Críticas

1. **Gestión de Contraseñas:**
   - Cifrar siempre con `bcrypt.hash(clave, 10)` antes de almacenar.
   - **NUNCA** loguear, retornar ni renderizar el campo `clave` (ni siquiera el hash) en ninguna vista, respuesta JSON o consola.
2. **Mensajes de Error de Autenticación Genéricos:**
   - Ante cualquier falla en el inicio de sesión (correo inexistente o contraseña incorrecta), mostrar siempre: `"Correo o clave incorrectos."` para evitar enumeración de cuentas.
3. **Asignación Segura de `created_by`:**
   - El campo `created_by` se obtiene **exclusivamente** desde el payload del token decodificado (`req.usuario!.id`).
   - **NUNCA** leer ni aceptar `created_by` desde `req.body` o el formulario del cliente.
4. **Protección de Rutas `/proyectos/*`:**
   - Todas las rutas bajo `/proyectos` pasan obligatoriamente por `verificarToken`.
   - Si no hay sesión válida o el token expiró, redirigir al usuario a `/login` (no enviar un error JSON 401 crudo, ya que son vistas web).
5. **Lectura de JWT:**
   - Prioridad 1: Cookie `token` (enviada automáticamente por el navegador).
   - Prioridad 2 (Fallback): Header `Authorization: Bearer <token>` (facilita pruebas con Postman/cURL).
6. **Vistas Handlebars Limpias (Logic-less):**
   - No colocar lógica de negocio en plantillas `.hbs`. Formatos (`formatFecha`, `formatMonto`) y comparaciones (`eq`) deben resolverse mediante los helpers registrados en `src/app.ts`.
7. **Estilos Tailwind:**
   - Usar solo clases utilitarias en el marcado HTML de los `.hbs`. Nunca modificar `public/css/styles.css` a mano.

---

## 💡 5. Lecciones Aprendidas y "Gotchas" Técnicos

### A. Copia de Plantillas `.hbs` en el Build de Producción
- **Problema:** `tsc` solo compila archivos TypeScript a `dist/`; no copia archivos estáticos ni plantillas `.hbs`.
- **Solución implementada:** El script de build en `package.json` incluye la copia explícita de vistas:
  ```json
  "build": "pnpm build:css && tsc && cp -r src/views dist/views"
  ```

### B. Versión de Tailwind CSS (v3 vs v4)
- **Problema:** La versión 4 de Tailwind elimina `tailwind.config.js` y usa directivas `@import` distintas.
- **Solución implementada:** Se fijó la versión estable `tailwindcss@^3.4.x` y `@tailwindcss/forms@^0.5.x`, manteniendo total compatibilidad con `postcss.config.js` y `tailwind.config.js`.

### C. Compatibilidad de TypeScript con `ts-node-dev`
- **Problema:** Versiones preliminares de TypeScript 7 introducen cambios en la API interna (`ts.sys.fileExists`) que rompen `ts-node-dev`.
- **Solución implementada:** Utilizar TypeScript 5.x (`^5.7.x` / `^5.9.x`) junto con `"types": ["node"]` en `tsconfig.json`.

### D. `method-override` con Tipado de TypeScript
- **Problema:** `@types/method-override` requiere que la función getter retorne un tipo `string` (no `string | undefined`).
- **Solución implementada:** En `src/app.ts`, la función getter retorna `req.method` por defecto cuando no se detecta `_method`:
  ```ts
  app.use(
    methodOverride((req) => {
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        const method = (req.body as Record<string, unknown>)._method;
        delete (req.body as Record<string, unknown>)._method;
        return method as string;
      }
      return req.method;
    }),
  );
  ```

### E. Manejo de Errores en Servicio UF (`mindicador.cl`)
- **Problema:** Caídas de red o indisponibilidad de la API externa no deben romper la carga de la vista `/proyectos`.
- **Solución implementada:** `src/services/uf.service.ts` encapsula el `fetch` en un bloque `try/catch` devolviendo `{ fecha: '', valor: 0 }` como fallback seguro.

### F. Prisma 7 requiere un Driver Adapter explícito
- **Problema:** A diferencia de versiones anteriores, `PrismaClient` de Prisma 7 **no lee `DATABASE_URL` automáticamente** ni usa el motor binario clásico; requiere un *driver adapter*.
- **Solución implementada:** `src/config/db.ts` instancia `new PrismaPg({ connectionString: process.env.DATABASE_URL })` (paquete `@prisma/adapter-pg`, que a su vez depende de `pg`) y lo pasa como `adapter` al construir `PrismaClient`. El `datasource` en `schema.prisma` no necesita `url = env(...)`.
- El import correcto del cliente generado es `../generated/prisma/client` (no `../generated/prisma`, que no tiene `index.ts`).

### G. `npx prisma init` instala carpetas de "skills" para agentes IA
- **Problema:** Desde Prisma 7, `prisma init` crea además `.claude/skills/`, `.windsurf/skills/`, `.agents/skills/` y `skills-lock.json` con documentación de referencia para herramientas agénticas. No son parte del proyecto.
- **Solución implementada:** Se eliminaron tras `prisma init`. Si se vuelve a correr `prisma init` (o `prisma generate` las regenera), limpiar esas carpetas.
- También duplica `DATABASE_URL` al final de `.env` con credenciales placeholder (`johndoe:randompassword`) si ya existía la variable — revisar y limpiar manualmente tras correr `prisma init`.

### H. Puerto de Docker "colgado" si un proceso host ocupó el mismo puerto antes de publicar el contenedor
- **Problema:** En WSL2 + Docker Desktop, si un proceso corre en el host (ej. `pnpm dev` con `ts-node-dev`) ocupando el puerto 3000 mientras `docker compose up` intenta publicar el mismo puerto del contenedor `app`, el forwarding de Docker Desktop puede quedar en mal estado: el contenedor arranca "healthy" pero `curl localhost:3000` da `Connection refused` o —peor— responde el proceso host viejo con env vars obsoletas cacheadas en memoria.
- **Solución implementada:** Antes de `docker compose up`, verificar que no haya un `pnpm dev`/`ts-node-dev` corriendo en el host sobre el mismo puerto (`ps aux | grep ts-node-dev`). Si el puerto quedó en mal estado tras matar el proceso host, `docker compose restart app` para que Docker Desktop vuelva a publicar el puerto limpio.

---

## ⚡ 6. Comandos del Proyecto

```bash
# Instalar dependencias
pnpm install

# Modo Desarrollo (Servidor con hot-reload + Watch de Tailwind en paralelo)
# Requiere un PostgreSQL accesible en DATABASE_URL (ver .env) — ej. `docker compose up -d db`
pnpm dev

# Correr solo el servidor en desarrollo
pnpm dev:server

# Correr solo el watcher de Tailwind
pnpm dev:css

# Compilar CSS para producción
pnpm build:css

# Build completo de producción (CSS + TypeScript + Copia de vistas)
pnpm build

# Iniciar servidor en modo producción (desde dist/server.js)
pnpm start

# Chequeo estático de tipos sin emitir código
pnpm exec tsc --noEmit

# --- Prisma ---
# Regenerar el cliente tras cambiar prisma/schema.prisma
npx prisma generate

# Crear y aplicar una nueva migración en desarrollo (requiere DB accesible en DATABASE_URL)
npx prisma migrate dev --name <nombre>

# Aplicar migraciones pendientes sin generar nuevas (usado por el Dockerfile al arrancar)
npx prisma migrate deploy

# --- Docker (app + PostgreSQL completos) ---
# Build y arranque de ambos servicios
docker compose up -d --build

# Ver logs del servidor
docker compose logs -f app

# Reconstruir solo la app (ej. tras agregar una migración nueva)
docker compose up -d --build app

# Detener todo (los datos de Postgres persisten en el volumen `pgdata`)
docker compose down
```

---

## 🧪 7. Credenciales y Flujo de Prueba Rápido

Los datos se persisten en PostgreSQL (vía Docker o una instancia local apuntada por `DATABASE_URL`):
1. Levantar la app: `docker compose up -d --build` (o `pnpm dev` con `DATABASE_URL` apuntando a una DB accesible).
2. Acceder a `http://localhost:3000/registro`.
3. Registrar un usuario de prueba (ej. Correo: `admin@test.cl`, Clave: `123456`).
4. Iniciar sesión en `http://localhost:3000/login`.
5. El sistema redirige automáticamente a `/proyectos`, permitiendo crear, editar, visualizar y eliminar proyectos — persistidos de verdad en PostgreSQL.
