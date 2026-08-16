# Plan de Implementación: Prisma ORM con PostgreSQL

Este plan detalla los pasos necesarios para migrar la persistencia en memoria del proyecto a una base de datos PostgreSQL utilizando Prisma ORM, respetando la arquitectura MVC existente.

## Fase 1: Instalación y Configuración Inicial

- [x] **Paso 1.1: Instalar dependencias**
  - Instalar Prisma CLI como dependencia de desarrollo: `pnpm add -D prisma`
  - Instalar el cliente de Prisma: `pnpm add @prisma/client`

- [x] **Paso 1.2: Inicializar Prisma**
  - Ejecutar `npx prisma init` para generar la carpeta `prisma/` con `schema.prisma` y agregar `DATABASE_URL` al archivo `.env`.

- [x] **Paso 1.3: Configurar variables de entorno**
  - Actualizar `.env` y `.env.example` con la variable `DATABASE_URL` (ej: `postgresql://postgres:desarrollo_software_1@localhost:5432/desarrollo_software_1?schema=public`).
  *(Nota: Se deben ajustar las credenciales a las usadas en desarrollo local).*
  - Eliminar de `.env` y `.env.example` las variables MySQL-style obsoletas (`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`), ya que Prisma usa exclusivamente `DATABASE_URL`.

## Fase 2: Definición del Esquema (Schema)

- [x] **Paso 2.1: Definir el modelo `Usuario` en `schema.prisma`**
  - `id`: `Int @id @default(autoincrement())`
  - `nombre`: `String`
  - `correo`: `String @unique`
  - `clave`: `String`
  - Relación `proyectos`: `Proyecto[]`

- [x] **Paso 2.2: Definir el modelo `Proyecto` en `schema.prisma`**
  - `id`: `Int @id @default(autoincrement())`
  - `nombre`: `String`
  - `fecha_inicio`: `String` — se mantiene como `String` (no `DateTime`) porque `editar.hbs` asigna el valor directamente a un `<input type="date">` (formato `YYYY-MM-DD`); si Prisma lo devolviera como `Date`, Handlebars lo stringificaría con `Date.toString()` y rompería el pre-llenado del formulario de edición.
  - `estado`: `String`
  - `responsable`: `String`
  - `monto`: `Int`
  - `created_by`: `Int`
  - Relación `creador`: `Usuario @relation(fields: [created_by], references: [id])`

- [x] **Paso 2.3: Ejecutar migración inicial**
  - Crear la base de datos y aplicar el esquema con: `npx prisma migrate dev --name init` (ejecutado contra el PostgreSQL dockerizado, expuesto en `localhost:5432`). Generó `prisma/migrations/20260816231954_init/`.

## Fase 3: Integración en el Código (Refactorización)

- [x] **Paso 3.1: Instanciar Prisma Client**
  - Modificar `src/config/db.ts` para exportar una instancia única de `PrismaClient` a toda la aplicación, reemplazando por completo el `dbConfig` placeholder actual (no se usa en ningún otro archivo, por lo que se puede eliminar sin dejar imports rotos).
  - No se requiere migración de datos: los modelos en memoria arrancan vacíos (`nextId = 1`), por lo que no hay data existente que trasladar a PostgreSQL.
  - Nota (surgida durante la ejecución): Prisma 7 usa "driver adapters" — `PrismaClient` ya no lee `DATABASE_URL` automáticamente. Se agregó `@prisma/adapter-pg` + `pg` como dependencias y `db.ts` pasa `new PrismaPg({ connectionString: process.env.DATABASE_URL })` como `adapter`.

- [x] **Paso 3.2: Refactorizar `src/models/usuario.model.ts`**
  - Eliminar el arreglo en memoria.
  - Reemplazar funciones síncronas (`create`, `findByCorreo`, `findById`) por métodos asíncronos que usen `prisma.usuario`.

- [x] **Paso 3.3: Refactorizar `src/models/proyecto.model.ts`**
  - Eliminar el arreglo en memoria.
  - Reemplazar funciones CRUD síncronas (`findAll`, `findById`, `create`, `update`, `remove`) por métodos asíncronos que usen `prisma.proyecto`.

- [x] **Paso 3.4: Actualizar Controladores**
  - Refactorizar `src/controllers/auth.controller.ts` para usar `await` en todas las llamadas al modelo de usuario.
  - Refactorizar `src/controllers/proyecto.controller.ts` para usar `await` en todas las llamadas al modelo de proyecto.
  - Actualizar el tipado de respuestas si es necesario.

## Fase 4: Pruebas y Ajustes Finales

- [x] **Paso 4.1: Verificar Tipos**
  - Ejecutar `pnpm exec tsc --noEmit` para asegurar que el refactor asíncrono no rompió dependencias de TypeScript.

- [x] **Paso 4.2: Pruebas E2E**
  - Ejecutada contra la app dockerizada (`docker compose up`, ver Fase 5) en lugar de `pnpm dev`.
  - Verificado vía `curl`: registro (200), login (302 → `/proyectos`), creación de "App Movil" (302 → `/proyectos`, aparece en el listado), `clave` nunca se expone en el HTML, logout (302 → `/login`), acceso sin cookie tras logout redirige a `/login`.
  - Confirmado con `psql` directo contra el contenedor `db` que las filas de `Usuario`/`Proyecto` quedan realmente en PostgreSQL (no en memoria). Datos de prueba limpiados con `TRUNCATE ... RESTART IDENTITY CASCADE` al terminar.

- [x] **Paso 4.3: Actualizar Documentación**
  - Reflejar el cambio de persistencia en `AGENTS.md` y `README.md`.

## Fase 5: Dockerización completa de la aplicación

_(Fase agregada durante la ejecución, a pedido del usuario: no solo la BD sino toda la app corre en Docker.)_

- [x] **Paso 5.1: `Dockerfile`**
  - Imagen `node:20-alpine`, single-stage: `pnpm install --frozen-lockfile` → `pnpm exec prisma generate` → `pnpm build` (Tailwind + `tsc` + copia de vistas).
  - `CMD` corre `prisma migrate deploy` antes de levantar `node dist/server.js`, para aplicar migraciones pendientes al iniciar el contenedor.
  - Se optó por instalar también las devDependencies en la imagen final (en vez de un stage runtime separado) porque el proyecto es de alcance académico y así se evita duplicar la resolución de deps solo para ahorrar tamaño de imagen; el CLI de `prisma` (devDependency) queda disponible para el `migrate deploy` del `CMD`.

- [x] **Paso 5.2: `docker-compose.yml`**
  - Servicio `db`: `postgres:16-alpine`, credenciales desde `POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB` (nuevas variables en `.env`), volumen persistente `pgdata`, healthcheck con `pg_isready`.
  - Servicio `app`: build del `Dockerfile`, espera a que `db` esté healthy, `DATABASE_URL` interno apunta a `db:5432` (no `localhost`) usando las mismas credenciales.
  - `.env` mantiene un `DATABASE_URL` separado apuntando a `localhost:5432` para poder correr `prisma migrate dev`/introspección desde el host contra el mismo Postgres (publicado en `5432:5432`).

- [x] **Paso 5.3: `.dockerignore`**
  - Excluye `node_modules`, `dist`, `src/generated` y `.env` (secretos nunca se hornean en la imagen; se inyectan vía `environment:` en compose).

- [x] **Paso 5.4: Build y validación end-to-end en Docker**
  - `docker compose up -d --build` construye ambas imágenes y levanta `db` + `app`.
  - Se detectó y limpió un residuo de `prisma init`: instaló carpetas `.claude/skills`, `.windsurf`, `.agents` y `skills-lock.json` (material de referencia para agentes IA, ajeno al proyecto) — eliminadas.
  - Se detectó y corrigió un `DATABASE_URL` placeholder (`johndoe:randompassword`) que `prisma init` había duplicado al final de `.env`.
  - E2E (Paso 4.2) verificado contra el contenedor real, incluyendo confirmación por `psql` de que los datos persisten en PostgreSQL.
  - Nota de entorno (no bloqueante, ya resuelta): un proceso `pnpm dev` viejo corriendo en el host WSL, junto con el arranque del contenedor, dejó el forwarding de Docker Desktop para el puerto 3000 en mal estado. Solución: detener el proceso host y `docker compose restart app` para que el puerto se vuelva a publicar limpio.
