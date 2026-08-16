# 🚀 Tech Solutions — Sistema de Gestión de Proyectos

Sistema web desarrollado bajo el patrón de arquitectura **MVC** con **Node.js**, **TypeScript**, **Express**, **Handlebars** y **Tailwind CSS**.

El proyecto integra gestión de proyectos, consulta de servicios externos en tiempo real (valor diario de la UF chilena) y un módulo seguro de autenticación sin estado mediante JSON Web Tokens (JWT) en cookies `httpOnly`.

---

## 📋 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Stack Tecnológico](#-stack-tecnológico)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Comandos Disponibles](#-comandos-disponibles)
- [Guía de Uso Rápido](#-guía-de-uso-rápido)
- [Consideraciones de Seguridad](#-consideraciones-de-seguridad)

---

## ✨ Características Principales

### 1. 📊 Módulo de Proyectos (CRUD)
- **Listar Proyectos:** Tabla interactiva con estados clasificados por colores (*pendiente*, *en curso*, *finalizado*), montos formateados en moneda nacional y acciones directas.
- **Crear Proyecto:** Formulario con asignación automática del usuario creador (`created_by`) derivado del token de sesión.
- **Detalle de Proyecto:** Información completa del proyecto, incluyendo el nombre del usuario responsable y del creador.
- **Editar y Eliminar:** Edición y borrado de proyectos mediante formularios HTML estándar utilizando `method-override` para los verbos HTTP `PUT` y `DELETE`.

### 2. 🇨🇱 Componente Reutilizable: Widget UF
- Consulta en tiempo real el valor diario de la Unidad de Fomento (UF) desde la API pública de [`mindicador.cl`](https://mindicador.cl).
- Componente de dos capas: servicio desacoplado (`uf.service.ts`) + vista reutilizable (`views/partials/uf-widget.hbs`).
- Manejo resiliente de errores ante caídas de red o falta de conexión.

### 3. 🔐 Módulo de Autenticación & Seguridad
- **Registro y Login:** Formulario de registro con contraseñas cifradas unidireccionalmente mediante `bcryptjs` (salt rounds = 10).
- **Manejo de Sesión sin Estado:** Tokens JWT firmados almacenados en cookies seguras con atributo `httpOnly`.
- **Protección de Rutas:** Middleware `verificarToken` que resguarda todas las rutas bajo `/proyectos/*` y redirige a `/login` en caso de sesión inválida o ausente.
- **Protección contra enumeración de cuentas:** Respuestas de error genéricas en el login (`"Correo o clave incorrectos."`).

---

## 🛠 Stack Tecnológico

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

---

## 📂 Estructura del Proyecto

```text
proyecto_web/
├── public/
│   └── css/
│       └── styles.css          # CSS compilado por Tailwind (generado)
├── dist/                       # Salida compilada a JavaScript para producción
├── src/
│   ├── config/
│   │   └── db.ts               # Configuración de base de datos (preparado para fase futura)
│   ├── controllers/
│   │   ├── auth.controller.ts  # Controladores de registro, login y logout
│   │   └── proyecto.controller.ts # Controladores del CRUD de proyectos
│   ├── middlewares/
│   │   └── auth.middleware.ts  # Middleware verificarToken (JWT en cookie/header)
│   ├── models/
│   │   ├── usuario.model.ts    # Modelo en memoria para usuarios (IUsuario[])
│   │   └── proyecto.model.ts   # Modelo en memoria para proyectos (IProyecto[])
│   ├── routes/
│   │   ├── auth.routes.ts      # Rutas públicas (/registro, /login, /logout)
│   │   └── proyecto.routes.ts  # Rutas protegidas (/proyectos/*)
│   ├── services/
│   │   └── uf.service.ts       # Servicio que consume la API de mindicador.cl
│   ├── styles/
│   │   └── input.css           # Entrada de directivas Tailwind (@tailwind base, ...)
│   ├── types/
│   │   ├── usuario.d.ts        # Interface IUsuario
│   │   ├── proyecto.d.ts       # Interface IProyecto
│   │   └── express.d.ts        # Extensión de tipos de Express.Request con usuario
│   ├── views/
│   │   ├── layouts/
│   │   │   └── main.hbs        # Layout principal (HTML5, Navbar, Footer)
│   │   ├── partials/
│   │   │   └── uf-widget.hbs   # Widget que muestra el valor de la UF
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

## 📦 Requisitos Previos

- **Node.js:** Versión 18 o superior (recomendado Node.js 20 LTS).
- **pnpm:** Versión 9 o superior (`npm install -g pnpm`).

---

## ⚙️ Instalación y Configuración

1. **Clonar el repositorio o ingresar al directorio:**
   ```bash
   cd proyecto_web
   ```

2. **Instalar las dependencias con `pnpm`:**
   ```bash
   pnpm install
   ```

3. **Configurar las variables de entorno:**
   Copia el archivo de plantilla `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

   El archivo `.env` contendrá los valores por defecto:
   ```env
   PORT=3000
   JWT_SECRET=definir_una_clave_secreta_fuerte
   JWT_EXPIRES_IN=1h
   UF_API_URL=https://mindicador.cl/api/uf
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=desarrollo_software_1
   DB_NAME=desarrollo_software_1
   ```

---

## ⚡ Comandos Disponibles

| Comando | Descripción |
|---|---|
| `pnpm dev` | Levanta el servidor con **recarga automática** (`ts-node-dev`) y el compilador de Tailwind en modo **watch** en paralelo. |
| `pnpm dev:server` | Inicia únicamente el servidor Express en modo desarrollo. |
| `pnpm dev:css` | Inicia únicamente el watcher de Tailwind CSS. |
| `pnpm build:css` | Compila y minifica el archivo CSS para producción. |
| `pnpm build` | Compila CSS, transpila TypeScript a `dist/` y copia las plantillas `.hbs` a `dist/views`. |
| `pnpm start` | Inicia la aplicación en **modo producción** desde `dist/server.js`. |
| `pnpm exec tsc --noEmit` | Ejecuta el chequeo estático de tipos sin compilar archivos. |

---

## 🚦 Guía de Uso Rápido

> **Nota sobre persistencia:** En esta etapa académica, los datos se almacenan en arreglos en memoria.

1. **Iniciar el entorno de desarrollo:**
   ```bash
   pnpm dev
   ```
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

## 🛡️ Consideraciones de Seguridad

- **Protección de Credenciales:** La contraseña ingresada nunca se almacena en texto plano; se cifra con un hash seguro de `bcrypt`. Tampoco se envía ni renderiza en ninguna vista o respuesta.
- **Cookies Seguras (`httpOnly`):** El token JWT reside en una cookie inaccesible para scripts del lado del cliente (`document.cookie`), protegiendo la sesión ante ataques XSS.
- **Asignación Segura de `created_by`:** El ID del creador se extrae exclusivamente del JWT verificado en el backend, imposibilitando la suplantación de identidad en formularios.
- **Manejo de Errores Genéricos:** Los intentos fallidos de inicio de sesión devuelven mensajes genéricos para evitar la enumeración de usuarios.

---

## 📄 Licencia

Proyecto académico desarrollado para **Tech Solutions**.
