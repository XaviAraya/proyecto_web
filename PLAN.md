# Sistema de Gestión de Proyectos (Tech Solutions) — Plan de Implementación

> **Para ejecutores agénticos:** SUB-SKILL REQUERIDA: usar `superpowers:subagent-driven-development` (recomendado) o `superpowers:executing-plans` para implementar este plan tarea por tarea. Los pasos usan checkboxes (`- [ ]`) para seguimiento.

**Objetivo:** Construir el sistema MVC de gestión de proyectos (Node.js + TypeScript + Express + Handlebars + Tailwind) descrito en el brief, integrando Unidad 1 (CRUD de `Proyecto` + widget UF) y Unidad 2 (auth JWT que protege `/proyectos` y asigna `created_by`).

**Arquitectura:** Express con capas `routes → middlewares → controllers → models`, vistas Handlebars server-side, modelos como arrays estáticos tipados en memoria (sin BD real). JWT viaja en cookie httpOnly `token`; `verificarToken` decodifica y adjunta `req.usuario`, usado por `proyecto.controller.ts` para fijar `created_by`.

**Stack técnico:** pnpm, TypeScript (strict), Express, express-handlebars, Tailwind CSS, bcryptjs, jsonwebtoken, cookie-parser, method-override, dotenv, ts-node-dev, concurrently.

**Spec:** `Docs/BRIEF.md`

## Restricciones globales

- Usar **siempre pnpm**; nunca `npm`/`yarn` (evita lockfiles duplicados).
- `tsconfig.json`: `target: ES2020`, `module: CommonJS`, `rootDir: src`, `outDir: dist`, `strict: true`, `esModuleInterop: true`, `resolveJsonModule: true`.
- Nunca loguear ni devolver `clave` (ni cifrada) en ninguna respuesta o vista.
- Mensaje de error de login siempre genérico: "Correo o clave incorrectos." (no revelar cuál falló).
- `created_by` se asigna **solo** en el controlador desde `req.usuario!.id`; nunca se lee del `req.body`.
- Todas las rutas `/proyectos/*` pasan por `verificarToken`; sin sesión válida → redirigir a `/login` (no 401 crudo).
- JWT se lee desde la cookie `token`; fallback a header `Authorization: Bearer <token>` para pruebas con Postman.
- Sin lógica de negocio en `.hbs`: comparaciones/formatos van en helpers de Handlebars (`eq`, `formatFecha`, `formatMonto`) o en el controlador.
- Solo clases utilitarias de Tailwind en el markup; nunca editar `public/css/styles.css` a mano.
- Archivos por capa con sufijo: `*.model.ts`, `*.controller.ts`, `*.routes.ts`, `*.middleware.ts`, `*.service.ts`. Interfaces con prefijo `I` en `src/types/`.
- No hay framework de tests en este proyecto académico: cada tarea se verifica con `pnpm exec tsc --noEmit`, ejecución real del servidor y `curl`/navegador, no con suites automatizadas.

---

## Task 1: Bootstrap del proyecto y configuración base

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `.env`
- Create: `.env.example`
- Create: `src/config/db.ts`
- Create: `src/server.ts` (placeholder mínimo, se completa en Task 6)

**Interfaces:**
- Produces: scripts pnpm (`dev`, `dev:server`, `dev:css`, `build:css`, `build`, `start`), `dbConfig` exportado desde `src/config/db.ts` (no consumido aún, preparado para uso futuro).

- [x] **Step 1: Inicializar git y pnpm**

```bash
git init
pnpm init
```

- [x] **Step 2: Instalar dependencias runtime**

```bash
pnpm add express express-handlebars bcryptjs jsonwebtoken cookie-parser method-override dotenv
```

- [x] **Step 3: Instalar dependencias de desarrollo**

```bash
pnpm add -D typescript ts-node-dev tailwindcss@^3.4.17 postcss autoprefixer concurrently \
  @types/node @types/express @types/bcryptjs @types/jsonwebtoken @types/cookie-parser @types/method-override
```

- [x] **Step 4: Crear `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "types": ["node"],
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [x] **Step 5: Completar `package.json` (campos y scripts)**

Editar el `package.json` generado por `pnpm init` para que quede así (conservar el `name`/`version` que pnpm generó si difieren):

```json
{
  "name": "proyecto_web",
  "version": "1.0.0",
  "private": true,
  "main": "dist/server.js",
  "scripts": {
    "dev": "concurrently -n SERVER,CSS -c blue,green \"pnpm dev:server\" \"pnpm dev:css\"",
    "dev:server": "ts-node-dev --respawn --transpile-only src/server.ts",
    "dev:css": "tailwindcss -i ./src/styles/input.css -o ./public/css/styles.css --watch",
    "build:css": "tailwindcss -i ./src/styles/input.css -o ./public/css/styles.css --minify",
    "build": "pnpm build:css && tsc && cp -r src/views dist/views",
    "start": "node dist/server.js"
  }
}
```

- [x] **Step 6: Crear `.gitignore`**

```
node_modules/
dist/
.env
```

- [x] **Step 7: Crear `.env` y `.env.example`**

`.env`:
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

`.env.example` (mismas claves, sin valores sensibles):
```
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=
JWT_SECRET=
JWT_EXPIRES_IN=
UF_API_URL=https://mindicador.cl/api/uf
PORT=3000
```

- [x] **Step 8: Crear `src/config/db.ts` (placeholder, no se usa aún)**

```ts
// Configuración de conexión a base de datos — placeholder.
// No se usa todavía: los modelos actuales trabajan con arrays estáticos en memoria.
// Queda preparado para una futura integración real (ej. mysql2, TypeORM, Prisma).

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || '',
};
```

- [x] **Step 9: Crear `src/server.ts` placeholder mínimo (se reemplaza en Task 6)**

```ts
import 'dotenv/config';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
console.log(`Placeholder server.ts — PORT configurado en ${PORT}`);
```

- [x] **Step 10: Verificar compilación**

Run: `pnpm exec tsc --noEmit`
Expected: sin errores.

- [x] **Step 11: Commit**

```bash
git add package.json pnpm-lock.yaml tsconfig.json .gitignore .env.example src/config/db.ts src/server.ts
git commit -m "chore: bootstrap proyecto, tooling y config base"
```

Nota: `.env` queda ignorado por `.gitignore`, no se commitea.

---

## Task 2: Tailwind CSS y PostCSS

**Files:**
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `src/styles/input.css`
- Create: `public/css/styles.css` (generado, no editar a mano)

**Interfaces:**
- Produces: `public/css/styles.css` referenciado desde `views/layouts/main.hbs` (Task 6) vía `<link rel="stylesheet" href="/css/styles.css">`.

- [x] **Step 1: Instalar plugin opcional de formularios**

```bash
pnpm add -D @tailwindcss/forms@^0.5.7
```

- [x] **Step 2: Crear `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/views/**/*.hbs'],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
};
```

- [x] **Step 3: Crear `postcss.config.js`**

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [x] **Step 4: Crear `src/styles/input.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [x] **Step 5: Compilar CSS por primera vez**

Run: `pnpm build:css`
Expected: se crea `public/css/styles.css` sin errores (aún sin clases utilitarias generadas porque no existen vistas `.hbs` todavía — eso es correcto en este punto).

- [x] **Step 6: Commit**

```bash
git add tailwind.config.js postcss.config.js src/styles/input.css public/css/styles.css package.json pnpm-lock.yaml
git commit -m "chore: configurar Tailwind CSS y PostCSS"
```

---

## Task 3: Tipos compartidos y modelos estáticos

**Files:**
- Create: `src/types/usuario.d.ts`
- Create: `src/types/proyecto.d.ts`
- Create: `src/types/express.d.ts`
- Create: `src/models/usuario.model.ts`
- Create: `src/models/proyecto.model.ts`

**Interfaces:**
- Produces: `IUsuario`, `IProyecto`, `JwtPayload` (interfaces). Desde `usuario.model.ts`: `findAll(): IUsuario[]`, `findByCorreo(correo: string): IUsuario | undefined`, `findById(id: number): IUsuario | undefined`, `create(data: Omit<IUsuario,'id'>): IUsuario`. Desde `proyecto.model.ts`: `findAll(): IProyecto[]`, `findById(id: number): IProyecto | undefined`, `create(data: Omit<IProyecto,'id'>): IProyecto`, `update(id: number, data: Partial<Omit<IProyecto,'id'|'created_by'>>): IProyecto | undefined`, `remove(id: number): boolean`.

- [x] **Step 1: Crear `src/types/usuario.d.ts`**

```ts
export interface IUsuario {
  id: number;
  nombre: string;
  correo: string;
  clave: string;
}
```

- [x] **Step 2: Crear `src/types/proyecto.d.ts`**

```ts
export interface IProyecto {
  id: number;
  nombre: string;
  fecha_inicio: string;
  estado: string;
  responsable: string;
  monto: number;
  created_by: number;
}
```

- [x] **Step 3: Crear `src/types/express.d.ts`**

```ts
import { JwtPayload as BaseJwtPayload } from 'jsonwebtoken';

export interface JwtPayload extends BaseJwtPayload {
  id: number;
  correo: string;
}

declare global {
  namespace Express {
    interface Request {
      usuario?: JwtPayload;
    }
  }
}

export {};
```

- [x] **Step 4: Crear `src/models/usuario.model.ts`**

```ts
import { IUsuario } from '../types/usuario';

const usuarios: IUsuario[] = [];
let nextId = 1;

export function findAll(): IUsuario[] {
  return usuarios;
}

export function findByCorreo(correo: string): IUsuario | undefined {
  return usuarios.find((u) => u.correo === correo);
}

export function findById(id: number): IUsuario | undefined {
  return usuarios.find((u) => u.id === id);
}

export function create(data: Omit<IUsuario, 'id'>): IUsuario {
  const usuario: IUsuario = { id: nextId++, ...data };
  usuarios.push(usuario);
  return usuario;
}

export default usuarios;
```

- [x] **Step 5: Crear `src/models/proyecto.model.ts`**

```ts
import { IProyecto } from '../types/proyecto';

const proyectos: IProyecto[] = [];
let nextId = 1;

export function findAll(): IProyecto[] {
  return proyectos;
}

export function findById(id: number): IProyecto | undefined {
  return proyectos.find((p) => p.id === id);
}

export function create(data: Omit<IProyecto, 'id'>): IProyecto {
  const proyecto: IProyecto = { id: nextId++, ...data };
  proyectos.push(proyecto);
  return proyecto;
}

export function update(
  id: number,
  data: Partial<Omit<IProyecto, 'id' | 'created_by'>>,
): IProyecto | undefined {
  const proyecto = findById(id);
  if (!proyecto) return undefined;
  Object.assign(proyecto, data);
  return proyecto;
}

export function remove(id: number): boolean {
  const idx = proyectos.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  proyectos.splice(idx, 1);
  return true;
}

export default proyectos;
```

- [x] **Step 6: Verificar tipos y comportamiento de los modelos**

Run: `pnpm exec tsc --noEmit`
Expected: sin errores.

Crear un script temporal `scratch-models.ts` en la raíz para ejercitar el CRUD en memoria:

```ts
import * as UsuarioModel from './src/models/usuario.model';
import * as ProyectoModel from './src/models/proyecto.model';

const u = UsuarioModel.create({ nombre: 'Ana', correo: 'ana@test.cl', clave: 'hash' });
console.assert(UsuarioModel.findByCorreo('ana@test.cl')?.id === u.id, 'findByCorreo debe encontrar al usuario');

const p = ProyectoModel.create({
  nombre: 'Sitio web', fecha_inicio: '2026-01-01', estado: 'pendiente',
  responsable: 'Ana', monto: 1000, created_by: u.id,
});
console.assert(ProyectoModel.findAll().length === 1, 'debe haber 1 proyecto');
ProyectoModel.update(p.id, { estado: 'en curso' });
console.assert(ProyectoModel.findById(p.id)?.estado === 'en curso', 'update debe cambiar estado');
console.assert(ProyectoModel.remove(p.id) === true, 'remove debe retornar true');
console.assert(ProyectoModel.findAll().length === 0, 'debe quedar vacío tras remove');
console.log('OK: modelos estáticos funcionan');
```

Run: `pnpm exec ts-node-dev --transpile-only scratch-models.ts`
Expected: imprime `OK: modelos estáticos funcionan` sin `assert` fallidos.

Eliminar el script temporal:
```bash
rm scratch-models.ts
```

- [x] **Step 7: Commit**

```bash
git add src/types src/models
git commit -m "feat: tipos IUsuario/IProyecto y modelos estáticos en memoria"
```

---

## Task 4: Servicio de la UF (componente reutilizable, capa de servicio)

**Files:**
- Create: `src/services/uf.service.ts`

**Interfaces:**
- Consumes: `process.env.UF_API_URL` (Task 1).
- Produces: `obtenerUF(): Promise<{ fecha: string; valor: number }>`, consumida por `proyecto.controller.ts` (Task 7) y `views/partials/uf-widget.hbs` (Task 7).

- [x] **Step 1: Crear `src/services/uf.service.ts`**

```ts
export interface UfResultado {
  fecha: string;
  valor: number;
}

export async function obtenerUF(): Promise<UfResultado> {
  const url = process.env.UF_API_URL || 'https://mindicador.cl/api/uf';

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`UF API respondió con status ${res.status}`);
    }

    const data = (await res.json()) as { serie?: Array<{ fecha: string; valor: number }> };
    const serie = data.serie?.[0];

    if (!serie) {
      throw new Error('Formato de respuesta de la UF inesperado');
    }

    return { fecha: serie.fecha, valor: serie.valor };
  } catch (err) {
    console.error('Error obteniendo UF:', (err as Error).message);
    return { fecha: '', valor: 0 };
  }
}
```

- [x] **Step 2: Verificar tipos**

Run: `pnpm exec tsc --noEmit`
Expected: sin errores (el `fetch` global es tipado por `@types/node` para Node 18+; si aparece el error `Cannot find name 'fetch'`, agregar `"lib": ["ES2020", "DOM"]` a `compilerOptions` en `tsconfig.json` y volver a correr el chequeo).

- [x] **Step 3: Verificar el servicio contra la API real**

Crear script temporal `scratch-uf.ts`:

```ts
import 'dotenv/config';
import { obtenerUF } from './src/services/uf.service';

obtenerUF().then((uf) => {
  console.log('UF obtenida:', uf);
  console.assert(typeof uf.valor === 'number', 'valor debe ser number');
});
```

Run: `pnpm exec ts-node-dev --transpile-only scratch-uf.ts`
Expected: imprime `UF obtenida: { fecha: '...', valor: ... }` con un `valor` numérico > 0 (requiere conexión a internet). Si no hay conexión, debe imprimir el fallback `{ fecha: '', valor: 0 }` sin lanzar excepción — confirma el manejo de errores.

Eliminar el script:
```bash
rm scratch-uf.ts
```

- [x] **Step 4: Commit**

```bash
git add src/services
git commit -m "feat: servicio uf.service.ts para consultar mindicador.cl"
```

---

## Task 5: Middleware de autenticación

**Files:**
- Create: `src/middlewares/auth.middleware.ts`

**Interfaces:**
- Consumes: `JwtPayload` (Task 3, `src/types/express.d.ts`), `process.env.JWT_SECRET` (Task 1).
- Produces: `verificarToken(req: Request, res: Response, next: NextFunction): void`, adjunta `req.usuario: JwtPayload`. Consumido por `proyecto.routes.ts` (Task 7).

- [x] **Step 1: Crear `src/middlewares/auth.middleware.ts`**

```ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/express';

export function verificarToken(req: Request, res: Response, next: NextFunction): void {
  const cookieToken = req.cookies?.token as string | undefined;
  const authHeader = req.headers.authorization;
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  const token = cookieToken || headerToken;

  if (!token) {
    res.redirect('/login');
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.usuario = payload;
    next();
  } catch {
    res.clearCookie('token');
    res.redirect('/login');
  }
}
```

- [x] **Step 2: Verificar tipos**

Run: `pnpm exec tsc --noEmit`
Expected: sin errores.

- [x] **Step 3: Verificar el middleware con un token real e inválido**

Crear script temporal `scratch-middleware.ts`:

```ts
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { verificarToken } from './src/middlewares/auth.middleware';
import { Request, Response } from 'express';

const secret = process.env.JWT_SECRET as string;
const token = jwt.sign({ id: 1, correo: 'ana@test.cl' }, secret, { expiresIn: '1h' });

// Caso válido
let calledNext = false;
const reqValido = { cookies: { token }, headers: {} } as unknown as Request;
const resValido = {} as Response;
verificarToken(reqValido, resValido, () => { calledNext = true; });
console.assert(calledNext, 'debe llamar a next() con token válido');
console.assert((reqValido as any).usuario.id === 1, 'debe adjuntar req.usuario');

// Caso inválido
let redirected = '';
const reqInvalido = { cookies: { token: 'token-invalido' }, headers: {} } as unknown as Request;
const resInvalido = {
  redirect: (path: string) => { redirected = path; },
  clearCookie: () => {},
} as unknown as Response;
verificarToken(reqInvalido, resInvalido, () => {
  throw new Error('no debe llamar next() con token inválido');
});
console.assert(redirected === '/login', 'debe redirigir a /login con token inválido');

console.log('OK: middleware de autenticación funciona');
```

Run: `pnpm exec ts-node scratch-middleware.ts`
Expected: imprime `OK: middleware de autenticación funciona`.

Eliminar el script:
```bash
rm scratch-middleware.ts
```

- [x] **Step 4: Commit**

```bash
git add src/middlewares
git commit -m "feat: middleware verificarToken (cookie + fallback Authorization header)"
```

---

## Task 6: Autenticación (controlador, rutas, vistas) + bootstrap de la app Express

**Files:**
- Create: `src/controllers/auth.controller.ts`
- Create: `src/routes/auth.routes.ts`
- Create: `src/views/layouts/main.hbs`
- Create: `src/views/auth/login.hbs`
- Create: `src/views/auth/registro.hbs`
- Modify: `src/app.ts` (crear si no existe)
- Modify: `src/server.ts` (reemplazar placeholder de Task 1)

**Interfaces:**
- Consumes: `UsuarioModel` (Task 3), helpers Handlebars `eq`/`formatFecha`/`formatMonto` (definidos aquí, reutilizados en Task 7).
- Produces: rutas `GET/POST /registro`, `GET/POST /login`, `GET /logout`; `app` (Express) exportado por defecto desde `src/app.ts`, consumido por `src/server.ts` y por Task 7 (montaje de `/proyectos`).

- [x] **Step 1: Crear `src/controllers/auth.controller.ts`**

```ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import * as UsuarioModel from '../models/usuario.model';

export function mostrarRegistro(_req: Request, res: Response): void {
  res.render('auth/registro');
}

export async function registrarUsuario(req: Request, res: Response): Promise<void> {
  const { nombre, correo, clave } = req.body as { nombre?: string; correo?: string; clave?: string };

  if (!nombre || !correo || !clave) {
    res.render('auth/registro', { error: 'Todos los campos son obligatorios.' });
    return;
  }

  if (UsuarioModel.findByCorreo(correo)) {
    res.render('auth/registro', { error: 'Ese correo ya está registrado.' });
    return;
  }

  const claveHash = await bcrypt.hash(clave, 10);
  UsuarioModel.create({ nombre, correo, clave: claveHash });

  res.render('auth/registro', { exito: 'Usuario registrado correctamente. Ya puedes iniciar sesión.' });
}

export function mostrarLogin(_req: Request, res: Response): void {
  res.render('auth/login');
}

export async function iniciarSesion(req: Request, res: Response): Promise<void> {
  const { correo, clave } = req.body as { correo?: string; clave?: string };
  const usuario = correo ? UsuarioModel.findByCorreo(correo) : undefined;
  const claveValida = usuario && clave ? await bcrypt.compare(clave, usuario.clave) : false;

  if (!usuario || !claveValida) {
    res.render('auth/login', { error: 'Correo o clave incorrectos.' });
    return;
  }

  const payload = { id: usuario.id, correo: usuario.correo };
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as SignOptions['expiresIn'],
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET as string, options);

  res.cookie('token', token, { httpOnly: true });
  res.redirect('/proyectos');
}

export function cerrarSesion(_req: Request, res: Response): void {
  res.clearCookie('token');
  res.redirect('/login');
}
```

- [x] **Step 2: Crear `src/routes/auth.routes.ts`**

```ts
import { Router } from 'express';
import {
  mostrarRegistro,
  registrarUsuario,
  mostrarLogin,
  iniciarSesion,
  cerrarSesion,
} from '../controllers/auth.controller';

const router = Router();

router.get('/registro', mostrarRegistro);
router.post('/registro', registrarUsuario);
router.get('/login', mostrarLogin);
router.post('/login', iniciarSesion);
router.get('/logout', cerrarSesion);

export default router;
```

- [x] **Step 3: Crear `src/views/layouts/main.hbs`**

```hbs
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tech Solutions · Gestión de Proyectos</title>
  <link rel="stylesheet" href="/css/styles.css" />
</head>
<body class="bg-gray-50 min-h-screen flex flex-col">
  <header class="bg-slate-900 text-white">
    <nav class="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
      <a href="/proyectos" class="font-bold text-lg">Tech Solutions</a>
      <div class="flex gap-4 text-sm">
        <a href="/proyectos" class="hover:text-emerald-400">Proyectos</a>
        <a href="/proyectos/nuevo" class="hover:text-emerald-400">Nuevo proyecto</a>
        <a href="/logout" class="hover:text-red-400">Cerrar sesión</a>
      </div>
    </nav>
  </header>
  <main class="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
    {{{body}}}
  </main>
  <footer class="bg-slate-900 text-slate-400 text-center text-xs py-3">
    &copy; Tech Solutions — Proyecto académico
  </footer>
</body>
</html>
```

- [x] **Step 4: Crear `src/views/auth/login.hbs`**

```hbs
<div class="max-w-md mx-auto bg-white rounded-lg shadow p-6">
  <h1 class="text-xl font-bold mb-4">Iniciar sesión</h1>

  {{#if error}}
    <div class="mb-4 rounded bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">{{error}}</div>
  {{/if}}

  <form method="POST" action="/login" class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700">Correo</label>
      <input type="email" name="correo" required class="mt-1 block w-full rounded border-gray-300" />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700">Clave</label>
      <input type="password" name="clave" required class="mt-1 block w-full rounded border-gray-300" />
    </div>
    <button type="submit" class="w-full bg-slate-900 text-white rounded py-2 hover:bg-slate-700">
      Ingresar
    </button>
  </form>

  <p class="mt-4 text-sm text-gray-600">
    ¿No tienes cuenta? <a href="/registro" class="text-emerald-600 hover:underline">Regístrate</a>
  </p>
</div>
```

- [x] **Step 5: Crear `src/views/auth/registro.hbs`**

```hbs
<div class="max-w-md mx-auto bg-white rounded-lg shadow p-6">
  <h1 class="text-xl font-bold mb-4">Crear cuenta</h1>

  {{#if error}}
    <div class="mb-4 rounded bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">{{error}}</div>
  {{/if}}
  {{#if exito}}
    <div class="mb-4 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 text-sm">{{exito}}</div>
  {{/if}}

  <form method="POST" action="/registro" class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700">Nombre</label>
      <input type="text" name="nombre" required class="mt-1 block w-full rounded border-gray-300" />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700">Correo</label>
      <input type="email" name="correo" required class="mt-1 block w-full rounded border-gray-300" />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700">Clave</label>
      <input type="password" name="clave" required minlength="6" class="mt-1 block w-full rounded border-gray-300" />
    </div>
    <button type="submit" class="w-full bg-slate-900 text-white rounded py-2 hover:bg-slate-700">
      Registrarme
    </button>
  </form>

  <p class="mt-4 text-sm text-gray-600">
    ¿Ya tienes cuenta? <a href="/login" class="text-emerald-600 hover:underline">Inicia sesión</a>
  </p>
</div>
```

- [x] **Step 6: Crear `src/app.ts`**

```ts
import 'dotenv/config';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';
import { engine } from 'express-handlebars';

import authRoutes from './routes/auth.routes';

const app = express();

app.engine(
  '.hbs',
  engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials'),
    helpers: {
      eq: (a: unknown, b: unknown) => a === b,
      formatFecha: (fecha: string) => {
        if (!fecha) return '';
        const d = new Date(fecha);
        if (Number.isNaN(d.getTime())) return fecha;
        return d.toLocaleDateString('es-CL');
      },
      formatMonto: (monto: number) => {
        if (typeof monto !== 'number') return String(monto);
        return new Intl.NumberFormat('es-CL').format(monto);
      },
    },
  }),
);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (_req, res) => res.redirect('/proyectos'));

app.use('/', authRoutes);

app.use((_req, res) => {
  res.status(404).send('Página no encontrada');
});

export default app;
```

Nota: la línea `app.get('/', ...)` redirige a `/proyectos`, que todavía no existe como ruta — se agrega en Task 7. Hasta entonces, `/` devolverá 404 gestionado por el handler final; eso es esperado en este punto del plan.

- [x] **Step 7: Reemplazar `src/server.ts`**

```ts
import app from './app';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
```

- [x] **Step 8: Verificar tipos**

Run: `pnpm exec tsc --noEmit`
Expected: sin errores.

- [x] **Step 9: Levantar el servidor y verificar el flujo de registro/login con curl**

Run: `pnpm dev:server` (en segundo plano)

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/registro
curl -s -c cookies.txt -X POST http://localhost:3000/login \
  -d "correo=noexiste@test.cl" -d "clave=x" -o /dev/null -w "%{http_code}\n"

curl -s -X POST http://localhost:3000/registro \
  -d "nombre=Ana" -d "correo=ana@test.cl" -d "clave=secreta123" | grep -o "registrado correctamente"

curl -s -c cookies.txt -b cookies.txt -D - -X POST http://localhost:3000/login \
  -d "correo=ana@test.cl" -d "clave=secreta123" -o /dev/null | grep -i "location: /proyectos"

grep -q token cookies.txt && echo "cookie token presente"
rm cookies.txt
```

Expected:
- `GET /registro` → `200`.
- Login con credenciales inexistentes → `200` (re-renderiza login con error), no redirección.
- Registro exitoso → la respuesta contiene "registrado correctamente".
- Login válido → header `Location: /proyectos` presente y cookie `token` seteada.

Detener el servidor de desarrollo al terminar.

- [x] **Step 10: Commit**

```bash
git add src/controllers/auth.controller.ts src/routes/auth.routes.ts src/views/layouts src/views/auth src/app.ts src/server.ts
git commit -m "feat: auth (registro/login/logout) con JWT en cookie + bootstrap de Express"
```

---

## Task 7: Proyectos (CRUD protegido) + widget UF + integración final en la app

**Files:**
- Create: `src/controllers/proyecto.controller.ts`
- Create: `src/routes/proyecto.routes.ts`
- Create: `src/views/partials/uf-widget.hbs`
- Create: `src/views/proyectos/listar.hbs`
- Create: `src/views/proyectos/crear.hbs`
- Create: `src/views/proyectos/detalle.hbs`
- Create: `src/views/proyectos/editar.hbs`
- Create: `src/views/proyectos/eliminar.hbs`
- Modify: `src/app.ts:1-40` (montar `proyectoRoutes` bajo `/proyectos`)

**Interfaces:**
- Consumes: `ProyectoModel`, `UsuarioModel` (Task 3), `obtenerUF` (Task 4), `verificarToken` (Task 5), helpers `eq`/`formatFecha`/`formatMonto` (Task 6).
- Produces: rutas `GET/POST /proyectos`, `GET /proyectos/nuevo`, `GET/PUT/DELETE /proyectos/:id`, `GET /proyectos/:id/editar`, `GET /proyectos/:id/eliminar`, todas protegidas por `verificarToken`.

- [x] **Step 1: Crear `src/controllers/proyecto.controller.ts`**

```ts
import { Request, Response } from 'express';
import * as ProyectoModel from '../models/proyecto.model';
import * as UsuarioModel from '../models/usuario.model';
import { obtenerUF } from '../services/uf.service';

export function mostrarFormularioCreacion(_req: Request, res: Response): void {
  res.render('proyectos/crear');
}

export async function listarProyectos(_req: Request, res: Response): Promise<void> {
  const proyectos = ProyectoModel.findAll();
  const uf = await obtenerUF();
  res.render('proyectos/listar', { proyectos, uf });
}

export function crearProyecto(req: Request, res: Response): void {
  const { nombre, fecha_inicio, estado, responsable, monto } = req.body as Record<string, string>;

  ProyectoModel.create({
    nombre,
    fecha_inicio,
    estado,
    responsable,
    monto: Number(monto) || 0,
    created_by: req.usuario!.id,
  });

  res.redirect('/proyectos');
}

export function obtenerProyectoPorId(req: Request, res: Response): void {
  const id = Number(req.params.id);
  const proyecto = ProyectoModel.findById(id);

  if (!proyecto) {
    res.status(404).render('proyectos/listar', {
      proyectos: ProyectoModel.findAll(),
      error: 'Proyecto no encontrado.',
    });
    return;
  }

  const creador = UsuarioModel.findById(proyecto.created_by);
  res.render('proyectos/detalle', {
    proyecto,
    creadorNombre: creador ? creador.nombre : `Usuario #${proyecto.created_by}`,
  });
}

export function mostrarFormularioEdicion(req: Request, res: Response): void {
  const id = Number(req.params.id);
  const proyecto = ProyectoModel.findById(id);

  if (!proyecto) {
    res.redirect('/proyectos');
    return;
  }

  res.render('proyectos/editar', { proyecto });
}

export function actualizarProyecto(req: Request, res: Response): void {
  const id = Number(req.params.id);
  const { nombre, fecha_inicio, estado, responsable, monto } = req.body as Record<string, string>;

  const actualizado = ProyectoModel.update(id, {
    nombre,
    fecha_inicio,
    estado,
    responsable,
    monto: Number(monto) || 0,
  });

  if (!actualizado) {
    res.redirect('/proyectos');
    return;
  }

  res.redirect(`/proyectos/${id}`);
}

export function mostrarConfirmacionEliminar(req: Request, res: Response): void {
  const id = Number(req.params.id);
  const proyecto = ProyectoModel.findById(id);

  if (!proyecto) {
    res.redirect('/proyectos');
    return;
  }

  res.render('proyectos/eliminar', { proyecto });
}

export function eliminarProyecto(req: Request, res: Response): void {
  const id = Number(req.params.id);
  ProyectoModel.remove(id);
  res.redirect('/proyectos');
}
```

- [x] **Step 2: Crear `src/routes/proyecto.routes.ts`**

```ts
import { Router } from 'express';
import { verificarToken } from '../middlewares/auth.middleware';
import {
  listarProyectos,
  mostrarFormularioCreacion,
  crearProyecto,
  obtenerProyectoPorId,
  mostrarFormularioEdicion,
  actualizarProyecto,
  mostrarConfirmacionEliminar,
  eliminarProyecto,
} from '../controllers/proyecto.controller';

const router = Router();

router.use(verificarToken);

router.get('/', listarProyectos);
router.get('/nuevo', mostrarFormularioCreacion);
router.post('/', crearProyecto);
router.get('/:id', obtenerProyectoPorId);
router.get('/:id/editar', mostrarFormularioEdicion);
router.put('/:id', actualizarProyecto);
router.get('/:id/eliminar', mostrarConfirmacionEliminar);
router.delete('/:id', eliminarProyecto);

export default router;
```

Importante: `/nuevo` está declarado antes de `/:id` para que no sea capturado como `id="nuevo"`.

- [x] **Step 3: Crear `src/views/partials/uf-widget.hbs`**

```hbs
<div class="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm text-emerald-800">
  <span class="font-semibold">UF</span>
  {{#if uf.valor}}
    <span>${{formatMonto uf.valor}}</span>
    <span class="text-emerald-600">({{formatFecha uf.fecha}})</span>
  {{else}}
    <span class="text-emerald-600">no disponible</span>
  {{/if}}
</div>
```

- [x] **Step 4: Crear `src/views/proyectos/listar.hbs`**

```hbs
<div class="flex items-center justify-between mb-4">
  <h1 class="text-xl font-bold">Proyectos</h1>
  {{> uf-widget uf=uf}}
</div>

{{#if error}}
  <div class="mb-4 rounded bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">{{error}}</div>
{{/if}}

<div class="mb-4">
  <a href="/proyectos/nuevo" class="inline-block bg-slate-900 text-white rounded px-4 py-2 text-sm hover:bg-slate-700">
    + Nuevo proyecto
  </a>
</div>

<div class="bg-white rounded-lg shadow overflow-hidden">
  <table class="min-w-full divide-y divide-gray-200 text-sm">
    <thead class="bg-gray-100">
      <tr>
        <th class="px-4 py-2 text-left">Nombre</th>
        <th class="px-4 py-2 text-left">Inicio</th>
        <th class="px-4 py-2 text-left">Estado</th>
        <th class="px-4 py-2 text-left">Responsable</th>
        <th class="px-4 py-2 text-left">Monto</th>
        <th class="px-4 py-2 text-right">Acciones</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-100">
      {{#each proyectos}}
      <tr>
        <td class="px-4 py-2">{{this.nombre}}</td>
        <td class="px-4 py-2">{{formatFecha this.fecha_inicio}}</td>
        <td class="px-4 py-2">
          <span class="px-2 py-1 rounded-full text-xs
            {{#if (eq this.estado 'finalizado')}}bg-emerald-100 text-emerald-800
            {{else}}{{#if (eq this.estado 'en curso')}}bg-blue-100 text-blue-800
            {{else}}bg-yellow-100 text-yellow-800{{/if}}{{/if}}">
            {{this.estado}}
          </span>
        </td>
        <td class="px-4 py-2">{{this.responsable}}</td>
        <td class="px-4 py-2">${{formatMonto this.monto}}</td>
        <td class="px-4 py-2 text-right space-x-2">
          <a href="/proyectos/{{this.id}}" class="text-blue-600 hover:underline">Ver</a>
          <a href="/proyectos/{{this.id}}/editar" class="text-amber-600 hover:underline">Editar</a>
          <a href="/proyectos/{{this.id}}/eliminar" class="text-red-600 hover:underline">Eliminar</a>
        </td>
      </tr>
      {{else}}
      <tr><td colspan="6" class="px-4 py-6 text-center text-gray-500">No hay proyectos registrados.</td></tr>
      {{/each}}
    </tbody>
  </table>
</div>
```

- [x] **Step 5: Crear `src/views/proyectos/crear.hbs`**

```hbs
<div class="max-w-lg bg-white rounded-lg shadow p-6">
  <h1 class="text-xl font-bold mb-4">Nuevo proyecto</h1>
  <form method="POST" action="/proyectos" class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700">Nombre</label>
      <input type="text" name="nombre" required class="mt-1 block w-full rounded border-gray-300" />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700">Fecha de inicio</label>
      <input type="date" name="fecha_inicio" required class="mt-1 block w-full rounded border-gray-300" />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700">Estado</label>
      <select name="estado" required class="mt-1 block w-full rounded border-gray-300">
        <option value="pendiente">pendiente</option>
        <option value="en curso">en curso</option>
        <option value="finalizado">finalizado</option>
      </select>
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700">Responsable</label>
      <input type="text" name="responsable" required class="mt-1 block w-full rounded border-gray-300" />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700">Monto</label>
      <input type="number" name="monto" min="0" step="1" required class="mt-1 block w-full rounded border-gray-300" />
    </div>
    <button type="submit" class="w-full bg-slate-900 text-white rounded py-2 hover:bg-slate-700">
      Crear proyecto
    </button>
  </form>
</div>
```

- [x] **Step 6: Crear `src/views/proyectos/detalle.hbs`**

```hbs
<div class="max-w-lg bg-white rounded-lg shadow p-6 space-y-3">
  <h1 class="text-xl font-bold">{{proyecto.nombre}}</h1>
  <dl class="grid grid-cols-2 gap-y-2 text-sm">
    <dt class="text-gray-500">Fecha de inicio</dt>
    <dd>{{formatFecha proyecto.fecha_inicio}}</dd>
    <dt class="text-gray-500">Estado</dt>
    <dd>{{proyecto.estado}}</dd>
    <dt class="text-gray-500">Responsable</dt>
    <dd>{{proyecto.responsable}}</dd>
    <dt class="text-gray-500">Monto</dt>
    <dd>${{formatMonto proyecto.monto}}</dd>
    <dt class="text-gray-500">Creado por</dt>
    <dd>{{creadorNombre}}</dd>
  </dl>
  <div class="flex gap-3 pt-2">
    <a href="/proyectos/{{proyecto.id}}/editar" class="text-amber-600 hover:underline">Editar</a>
    <a href="/proyectos" class="text-gray-500 hover:underline">Volver</a>
  </div>
</div>
```

- [x] **Step 7: Crear `src/views/proyectos/editar.hbs`**

```hbs
<div class="max-w-lg bg-white rounded-lg shadow p-6">
  <h1 class="text-xl font-bold mb-4">Editar proyecto</h1>
  <form method="POST" action="/proyectos/{{proyecto.id}}" class="space-y-4">
    <input type="hidden" name="_method" value="PUT" />
    <div>
      <label class="block text-sm font-medium text-gray-700">Nombre</label>
      <input type="text" name="nombre" value="{{proyecto.nombre}}" required class="mt-1 block w-full rounded border-gray-300" />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700">Fecha de inicio</label>
      <input type="date" name="fecha_inicio" value="{{proyecto.fecha_inicio}}" required class="mt-1 block w-full rounded border-gray-300" />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700">Estado</label>
      <select name="estado" required class="mt-1 block w-full rounded border-gray-300">
        <option value="pendiente" {{#if (eq proyecto.estado 'pendiente')}}selected{{/if}}>pendiente</option>
        <option value="en curso" {{#if (eq proyecto.estado 'en curso')}}selected{{/if}}>en curso</option>
        <option value="finalizado" {{#if (eq proyecto.estado 'finalizado')}}selected{{/if}}>finalizado</option>
      </select>
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700">Responsable</label>
      <input type="text" name="responsable" value="{{proyecto.responsable}}" required class="mt-1 block w-full rounded border-gray-300" />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700">Monto</label>
      <input type="number" name="monto" value="{{proyecto.monto}}" min="0" step="1" required class="mt-1 block w-full rounded border-gray-300" />
    </div>
    <button type="submit" class="w-full bg-slate-900 text-white rounded py-2 hover:bg-slate-700">
      Guardar cambios
    </button>
  </form>
</div>
```

- [x] **Step 8: Crear `src/views/proyectos/eliminar.hbs`**

```hbs
<div class="max-w-md bg-white rounded-lg shadow p-6 space-y-4">
  <h1 class="text-xl font-bold">Eliminar proyecto</h1>
  <p class="text-gray-700">¿Seguro que deseas eliminar <strong>{{proyecto.nombre}}</strong>?</p>
  <form method="POST" action="/proyectos/{{proyecto.id}}" class="flex gap-3">
    <input type="hidden" name="_method" value="DELETE" />
    <button type="submit" class="bg-red-600 text-white rounded px-4 py-2 text-sm hover:bg-red-700">
      Sí, eliminar
    </button>
    <a href="/proyectos/{{proyecto.id}}" class="text-gray-500 hover:underline self-center">Cancelar</a>
  </form>
</div>
```

- [x] **Step 9: Modificar `src/app.ts` para montar las rutas de proyectos**

Agregar el import y el `app.use` (después del bloque creado en Task 6):

```ts
import proyectoRoutes from './routes/proyecto.routes';
```

```ts
app.use('/', authRoutes);
app.use('/proyectos', proyectoRoutes);
```

- [x] **Step 10: Verificar tipos**

Run: `pnpm exec tsc --noEmit`
Expected: sin errores.

- [x] **Step 11: Recompilar CSS con las vistas nuevas**

Run: `pnpm build:css`
Expected: `public/css/styles.css` ahora incluye las clases utilitarias usadas en todos los `.hbs` (tablas, formularios, badges de estado, etc.).

- [x] **Step 12: Verificación funcional del CRUD protegido con curl**

```bash
pnpm dev:server   # en segundo plano

# Sin sesión: /proyectos debe redirigir a /login
curl -s -D - -o /dev/null http://localhost:3000/proyectos | grep -i "location: /login"

# Login para obtener cookie
curl -s -c cookies.txt -X POST http://localhost:3000/login \
  -d "correo=ana@test.cl" -d "clave=secreta123" -o /dev/null

# Crear proyecto
curl -s -b cookies.txt -c cookies.txt -D - -X POST http://localhost:3000/proyectos \
  -d "nombre=Sitio+Web" -d "fecha_inicio=2026-01-01" -d "estado=pendiente" \
  -d "responsable=Ana" -d "monto=500000" -o /dev/null | grep -i "location: /proyectos"

# Listar debe contener el proyecto creado
curl -s -b cookies.txt http://localhost:3000/proyectos | grep -o "Sitio Web"

# Detalle en /proyectos/1
curl -s -b cookies.txt http://localhost:3000/proyectos/1 | grep -o "Ana"

# Editar vía PUT (method-override)
curl -s -b cookies.txt -D - -X PUT http://localhost:3000/proyectos/1 \
  -d "nombre=Sitio+Web+v2" -d "fecha_inicio=2026-01-01" -d "estado=en+curso" \
  -d "responsable=Ana" -d "monto=750000" -o /dev/null | grep -i "location: /proyectos/1"

# Eliminar vía DELETE (method-override)
curl -s -b cookies.txt -D - -X DELETE http://localhost:3000/proyectos/1 -o /dev/null \
  | grep -i "location: /proyectos"

rm cookies.txt
```

Expected: cada `grep` encuentra coincidencia (redirecciones y contenidos esperados en cada paso). Confirma: protección por `verificarToken`, `created_by` asignado automáticamente (visible en el detalle como "Ana"), y los tres verbos (POST/PUT/DELETE, estos últimos vía `method-override`) funcionando de punta a punta.

Detener el servidor.

- [x] **Step 13: Commit**

```bash
git add src/controllers/proyecto.controller.ts src/routes/proyecto.routes.ts src/views/partials src/views/proyectos src/app.ts public/css/styles.css
git commit -m "feat: CRUD de proyectos protegido por JWT + widget UF integrado"
```

---

## Task 8: Verificación end-to-end y build de producción

**Files:**
- No se crean archivos nuevos; solo verificación integral del sistema construido en Tasks 1–7.

- [x] **Step 1: Build completo de producción**

Run: `pnpm build`
Expected: `build:css` genera `public/css/styles.css` minificado, `tsc` compila `src/**/*.ts` a `dist/` y las plantillas de `src/views/` se copian a `dist/views/` sin errores.

- [x] **Step 2: Levantar en modo producción**

```bash
pnpm start   # en segundo plano, usa dist/server.js
```

Expected: log `Servidor escuchando en http://localhost:3000`.

- [x] **Step 3: Recorrer el flujo completo de usuario nuevo (registro → login → CRUD → logout → acceso denegado)**

```bash
BASE=http://localhost:3000

curl -s -X POST $BASE/registro -d "nombre=Beto" -d "correo=beto@test.cl" -d "clave=clave12345" \
  | grep -o "registrado correctamente"

curl -s -c c.txt -X POST $BASE/login -d "correo=beto@test.cl" -d "clave=clave12345" -o /dev/null

curl -s -b c.txt -c c.txt -D - -X POST $BASE/proyectos \
  -d "nombre=App+Movil" -d "fecha_inicio=2026-02-01" -d "estado=pendiente" \
  -d "responsable=Beto" -d "monto=2000000" -o /dev/null | grep -i "location: /proyectos"

curl -s -b c.txt $BASE/proyectos | grep -o "App Movil"

curl -s -b c.txt $BASE/logout -D - -o /dev/null | grep -i "location: /login"

# Tras logout, la cookie sigue en el archivo pero el server la limpió del lado servidor;
# usar un cookie jar vacío para simular navegador sin sesión:
curl -s -D - -o /dev/null $BASE/proyectos | grep -i "location: /login"

rm c.txt
```

Expected: registro exitoso, login con cookie, creación de proyecto redirige a `/proyectos`, el listado contiene "App Movil", logout redirige a `/login`, y acceso sin cookie a `/proyectos` redirige a `/login`.

- [x] **Step 4: Confirmar que `clave` nunca se expone**

```bash
curl -s -b c.txt $BASE/proyectos 2>/dev/null | grep -i "clave" || echo "OK: clave no aparece en el HTML"
```

(recrear `c.txt` con un login válido si se eliminó en el paso anterior). Expected: `OK: clave no aparece en el HTML`.

- [x] **Step 5: Detener el servidor**

```bash
# detener el proceso pnpm start iniciado en el Step 2
```

- [x] **Step 6: Revisión final contra el brief**

Confirmar manualmente contra `Docs/BRIEF.md`:
- [x] Todas las rutas de la tabla "Autenticación" y "Proyectos" responden como se especifica.
- [x] `created_by` nunca es editable desde el formulario de creación/edición.
- [x] Mensajes de error de login son genéricos.
- [x] `uf-widget` se muestra en `proyectos/listar.hbs`.
- [x] `.env` y `dist/` están en `.gitignore`; `.env.example` existe sin valores sensibles.

- [x] **Step 7: Commit final (si hubo ajustes durante la verificación)**

```bash
git add -A
git commit -m "chore: verificación end-to-end del sistema completo"
```

---

## Autorevisión (cobertura del brief)

- Estructura MVC de carpetas → Tasks 1–7 crean exactamente el árbol de `Docs/BRIEF.md`.
- `config/db.ts` placeholder → Task 1.
- Tipos `IUsuario`, `IProyecto`, `express.d.ts` → Task 3.
- Modelos estáticos tipados → Task 3.
- `uf.service.ts` + `uf-widget.hbs` (componente de dos capas) → Task 4 y Task 7.
- `auth.middleware.ts` (cookie + fallback `Authorization`) → Task 5.
- `auth.controller.ts` + `auth.routes.ts` + vistas de login/registro → Task 6.
- `proyecto.controller.ts` + `proyecto.routes.ts` protegidas + las 5 vistas de proyectos → Task 7.
- Helpers Handlebars `eq`/`formatFecha`/`formatMonto`, `defaultLayout: main`, partials automáticos → Task 6 y Task 7.
- Tailwind con `content` apuntando a `views/**/*.hbs`, build a `public/css/styles.css` → Task 2, recompilado en Task 7.
- Variables de entorno y `.env.example` → Task 1.
- Scripts pnpm (`dev`, `dev:server`, `dev:css`, `build:css`, `build`, `start`) → Task 1.
- Flujo de integración Unidad 1 ↔ Unidad 2 (`created_by` desde JWT) → Task 7, verificado end-to-end en Task 8.
