# Dorea

Aplicación de escritorio para **leer la Biblia y tomar notas**, con vinculación de notas a versículos concretos.

- **Frontend:** Angular 20 (standalone components, signals) + Tailwind CSS 3.
- **Backend:** Tauri 2 con comandos en Rust.
- **Datos:** en desarrollo, `src-tauri/Data/`; en producción, el directorio de datos de la app.
- **Documentación:** comandos del puente Tauri en [`docs/comandos-tauri.md`](./docs/comandos-tauri.md).

## Requisitos

- Node.js 20+ y pnpm (`corepack enable pnpm`).
- Rust (stable) y las dependencias de Tauri para tu sistema.
- Linux: `webkit2gtk`, `libgtk-3-dev`, `librsvg2-dev`, `build-essential`, `libssl-dev`.

## Instalación

```bash
pnpm install
```

## Desarrollo

```bash
# Solo el frontend (navegador, puerto 1420)
pnpm run start

# App completa de escritorio (compila Angular + Rust)
pnpm run tauri:dev
```

## Compilar / empaquetar

```bash
# Bundle del frontend
pnpm run build

# Ejecutable de escritorio (instaladores)
pnpm run tauri:build
```

## Comprobaciones

```bash
# Tipado del frontend (sin emitir)
pnpm run check

# Lint y formato del frontend
pnpm run lint
pnpm run format:check

# Compilación del backend Rust
cd src-tauri && cargo check

# Formato y lints de Rust
pnpm run rust:fmt
pnpm run rust:clippy
```

## Estructura

```
src/                      Frontend Angular
  app/
    components/           Componentes reutilizables (sidebar, topbar, mark, ...)
    pages/                Páginas enrutadas (main, notes, settings)
    services/             Estado y acceso a Tauri (signals)
    interfaces/           Tipos compartidos
    directives/           Directivas propias
src-tauri/                Backend Tauri/Rust
  src/
    bible/                Lectura de biblias, índice de búsqueda y marcas
    notes/                CRUD de notas y carpetas, notas vinculadas
    settings/             Ajustes e idioma
    helpers/              Rutas de datos y utilidades
  Data/                   Datos de usuario (biblias, notas, marcas, idioma)
  resources/              Recursos de la app (idioma por defecto, plantillas)
```

## Estado del proyecto

Proyecto en desarrollo temprano. Pendientes conocidos y hoja de ruta en [`pulimiento.md`](./pulimiento.md).
