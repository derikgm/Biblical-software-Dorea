# Pulimiento — Dorea

Lista de tareas de mejora del proyecto (errores, correcciones, limpieza, organización, diseño y buenas prácticas).

> Proyecto: **Dorea** — app de escritorio de lectura bíblica y notas.
> Stack: **Angular 20** (standalone, signals) + **Tauri 2** + **Rust** + **Tailwind CSS 3**.
> Estado de compilación actual (tras los arreglos aplicados):
> - `pnpm run build` (development): **OK**.
> - `pnpm run check` (`noUnusedLocals`/`noUnusedParameters`): **OK**.
> - `cargo check` / `cargo check --release`: **OK**.
> - `cargo fmt --check` / `cargo clippy`: **OK** (sin avisos).
> - `cargo test --lib`: **OK** (5/5).
> - `pnpm run lint` / `pnpm run format:check`: **OK** (0 errores, 0 avisos; accesibilidad de plantillas exigida como error).

Prioridades: 🔴 Crítico · 🟠 Alto · 🟡 Medio · 🟢 Bajo

Leyenda: `[x]` cumplido · `[ ]` pendiente.

---

## Resumen de progreso

- **Sección 1 (críticos):** 5/5 completados.
- **Sección 2 (lógica):** 14/16 completados.
- **Sección 3 (Rust):** 10/15 completados.
- **Sección 4 (limpieza):** 5/7 completados.
- **Sección 5 (organización):** 9/15 completados.
- **Sección 6 (diseño):** 4/14 completados.
- **Sección 7 (accesibilidad):** 3/6 completados.
- **Sección 8 (rendimiento):** 5/8 completados.
- **Sección 9 (seguridad):** 5/5 completados.
- **Sección 10 (tooling/build):** 7/10 completados.
- **Sección 11 (pruebas):** 1/3 completados.
- **Sección 12 (documentación):** 2/4 completados.

---

## 1. Errores críticos (bloqueantes)

- [x] 🔴 **El backend Rust no compila.** En `src-tauri/src/notes/notes_handler.rs` había un cambio sin commitear `notes = notes_file_json;` que asignaba un `HashMap` a un `MutexGuard<HashMap>`. Solución: `*notes = notes_file_json;` (reescrito en la fusión de linked notes). ✅
- [x] 🔴 **Ctrl+S en notas no guarda nada.** `notes-page.ts` llamaba `invoke("save_with_metada", ...)`, comando inexistente. Ahora usa `save_note` (registrado) con el contenido del textarea, `old_content`, `current_content` y manejo de error. ✅
- [x] 🔴 **El guardado desactiva el guardado real.** Se restableció la llamada a `save_note`. ✅
- [x] 🔴 **`apply_marks()` usa la clave equivocada del mapa de marcas.** `main-page.ts` usaba `marks.get(this.current_chapter)`; ahora usa `(current_book()?.nr ?? 1) - 1`, que es el índice por libro. ✅
- [x] 🔴 **El redimensionado del sidebar nunca termina.** `enabled_resizing()` ahora registra un `mouseup` autocontenido que llama a `disable_resizing()`; también se limpia el flag `enabled_extended_sidebar_rezising`. ✅

---

## 2. Errores de lógica y comportamiento

- [x] 🟠 **`is_from_link_note` nunca se resetea.** Se resetea a `false` tras vincular una marca en `jump_to_note_page()` (`search_note-component.ts`). ✅
- [x] 🟠 **Spinner que queda encendido.** `select_bible` ahora pone `is_loading.set(false)` al final. ✅
- [x] 🟠 **Spinner que no se muestra.** `get_avaliable_bibles` mueve `is_loading.set(false)` a `next`/`error`/`complete`. ✅ (bonus: se corrigió `available_biblies.length` → `available_biblies().length`, que era `undefined` y rompía la condición)
- [x] 🟠 **Deduplicación de marcas rota.** `save_mark` ahora compara por valor con `.some(...)`. ✅
- [x] 🟠 **`fixSelection()` con `radix` incorrecto y frágil.** Ahora detecta si el contenedor final de la selección es `SUP` (número de versículo) en lugar de `parseInt(..., 2)`. ✅
- [x] 🟠 **`notes-page.html` muestra el literal `lang.no_linked_verse`.** Ahora `{{ lang.data()?.notes?.no_linked_verse }}`; se añadió la clave a la interfaz, `resources/en.json`, `Data/languages/en.json` y al struct `NoteOptions` (con `#[serde(default)]`). ✅
- [x] 🟠 **`FolderServices.current_content` no se inicializaba al crear una nota.** `create_new_note()` ahora setea `old_content` y `current_content` a `""` al crear la nota. ✅
- [x] 🟡 **`finish_to_create()` asumía que el último elemento era el nuevo.** Ahora localiza el objeto temporal por referencia y lo elimina con `findIndex`/`splice`, no con `pop()`. ✅
- [x] 🟡 **`update_name_from_sidebar` cerraba el input aunque fallara.** Ahora solo llama a `finish_to_rename()` si el `invoke` tiene éxito y registra el error con `console.error`. ✅
- [x] 🟡 **`open_file()` "descartaba" la `folder`.** El parámetro se usa para `current_dir` y la lectura usa `note.dir` (correcto); se eliminó el comentario/código muerto. ✅
- [x] 🟡 **`delete_folder_or_file` navegaba el árbol por nombre**, lo que podía borrar la carpeta equivocada si había nombres duplicados. Ahora elimina por **referencia** (`indexOf`) con búsqueda recursiva `remove_folder_from_tree`. ✅
- [x] 🟡 **`bible-services.select_bible` duplicaba lógica.** Reescrito: setea `current_bible`, delega en `set_current_chapter(1, 1)` y envuelve en `try/finally` el spinner. ✅
- [x] 🟡 **`handler_chapter_visibility` con comparaciones borde dudosas** (`main-page.ts`). Revisado: los capítulos van de 1 en adelante (`$index + 1`), por lo que `current_chapter - 1` con `current_chapter = 0` da `-1` y no coincide con ningún capítulo real; no hay comportamiento erróneo. ✅
- [x] 🟡 **`VisibleDirective` con `threshold: 0`** y comentario que decía "10% visible". Comentario corregido. ✅
- [x] 🟡 **`bible-services.search_in_bible` no limpiaba resultados ni manejaba `None`.** Ahora filtra palabras vacías, trata `null` como lista vacía y captura errores. ✅
- [x] 🟡 **`topbar.change_to` se capturaba una sola vez.** Era código muerto (no se usaba en la plantilla); eliminado junto a `lang` sin usar. ✅

---

## 3. Backend (Rust) — correcciones

- [x] 🟠 **`get_clean_word` mapeaba mal los acentos.** Ahora normaliza primero a minúsculas y mapea `á→a, é→e, í→i, ó→o, ú/ü→u`. ✅
- [x] 🟠 **`create_new_folder` ignoraba el nombre pedido en conflicto.** Ahora genera `<nombre> (N)` y propaga el error de `fs::create_dir`. ✅
- [x] 🟠 **`get_notes_folders` no fusionaba `linked_notes.json` con el árbol.** Las notas construidas en `surf_folders` recuperan ahora sus `linked_marks` desde el `HashMap` de notas vinculadas; se eliminó el `notes_searched` sin uso. Esto arregla que las marcas vinculadas no aparecieran al reabrir la app. ✅
- [ ] 🟠 **`get_all_bible` transfiere la Biblia completa por IPC** en cada selección (`bible_handler.rs`) y re-indexa. Cachear/limitar datos enviados al frontend.
- [x] 🟠 **`DATA_PATH = "./Data"` relativo al CWD** (`directory_handler.rs`). Ahora `init_data_dir()` resuelve la ruta al arrancar: en `debug` usa `./Data` (datos de desarrollo) y en `release` usa `app_data_dir()` de Tauri. ✅
- [ ] 🟠 **`save_linked_mark` reescribe todo el archivo** y mantiene notas en un `HashMap` en memoria; sin control de concurrencia entre archivo y estado.
- [ ] 🟡 **`get_marks` lee a estado pero retorna `vec_mark`** (`marker_handler.rs`); el `state.marks` nunca se usa para leer y `// marks.sort()` quedó comentado. Además `save_mark` no deduplica en backend.
- [ ] 🟡 **`Mutex::lock().unwrap()` en todas partes**; un `panic` si el lock se envenena. Manejar el error o usar `parking_lot`.
- [ ] 🟡 **`IndexedBible` mezcla dominios** (biblia, marcas, notas) en un único struct de estado. Separar estados.
- [ ] 🟡 **`get_available_list_of_bibles` guarda en `get_settings_path()`** aunque no es configuración. Usar su propia ruta.
- [x] 🟡 **Errores de escritura ignorados en los comandos de notas.** `save_note`, `update_file_name`, `create_new_note`/`create_new_folder` y `delete_note` ahora propagan el `Result` del `fs::*`. (Queda el `let _ =` del arranque de `directory_handler.rs`, que es creación de directorios base y es aceptable.) ✅
- [x] 🟢 **`settings_handler.rs`** usaba `format!("{}/settings.json", {get_settings_path()})` con llaves innecesarias. Limpiado. ✅
- [x] 🟢 **`language_handler.rs`** variable mal escrita `langauge_file_string`. Renombrada a `language_file_string`. ✅
- [x] 🟢 **`search_in_bible` imprimía con `println!`** y usaba `Vec::contains` O(n·m). Se quitaron los prints y se optimizó el cruce con `HashSet`. ✅
- [x] 🟢 **`save_note` estaba registrado pero sin uso** y devolvía `bool`. Ahora se usa desde `notes-page` (Ctrl+S). (Pendiente menor: estandarizar los tipos de retorno `bool` vs `()`.) ✅

---

## 4. Limpieza de código

- [x] 🟠 **Eliminar los 29 `console.log`** repartidos en `src/`. Reemplazados por `console.error` en rutas de error y eliminados los de depuración. Hora: `grep -rn "console.log" src/app` = 0. ✅
- [x] 🟠 **Eliminar código muerto y comentado.** Se borraron `app.component.css`, `notes-page.css`, `sidebar-component.css` (vacíos), `tree_folder-component.css` y `main-page.css` (solo comentario) junto con sus `styleUrl`; bloques comentados en `notes_handler.rs`, `app.component.ts`, `search-result-component.ts`; clase `dark-bg` duplicada en `sidebar-component.html`. ✅
- [x] 🟡 **Campos/imports sin usar.** Todos los señalados se limpiaron y el compilador ya no reporta `TS6133` con `noUnusedLocals`/`noUnusedParameters` activos. ✅
- [x] 🟡 **`notes_handler.rs`**: import `serde_json::json` sin usar y variable `notes_searched` sin efecto real. Eliminados. ✅
- [ ] 🟡 **Códigos de iconos/config duplicados**: `heroBars3, heroBars3CenterLeft, heroEquals, heroPause` se registran tanto en `main-page.ts` como en `bible-option-component.ts`; centralizar en una constante compartida.
- [x] 🟢 **`main-page.html`** tenía tres `(mouseup)` en el mismo elemento; unificados en `onMouseUp($event)`. ✅
- [ ] 🟢 **Ternarios y estilos inline** repetidos por toda la app; extraer a clases/utilidades.

---

## 5. Organización y buenas prácticas

- [x] 🟠 **Nombres de archivos inconsistentes.** Mezcla `_` y `-`: `bible_option-component.ts`, `folder_options-component.ts`, `mark_options-component.ts`, `search_note-component.ts`, `search_result-component.ts`, `tree_folder-component.ts`, `verse_navigation-component.ts`. Estandarizar. Todos renombrados a kebab-case con `git mv` (componentes, `tree-folder-interfaces.ts`, `font-settings-services.ts`, `global-settings-services.ts`, `marker-services.ts`, `sidebar-settings-services.ts`); imports y `templateUrl`/`styleUrl` actualizados. ✅
- [x] 🟠 **Carpeta mal escrita `src/app/stratergies/`.** Eliminada junto al `CustomRouteReuseStrategy` (código muerto, no estaba cableado). ✅
- [x] 🟠 **Prefijo de selectores incoherente.** `angular.json` define `prefix: "app"`, pero los selectores son `main-page`, `notes-page`, etc. sin prefijo. Todos los selectores de componentes y directivas usan ahora `app-`/`appX` (`app-bible-option`, `app-sidebar`, `app-tree-folder`, `appElementVisible`, etc.) y las plantillas se actualizaron. ESLint lo exige como error. ✅
- [ ] 🟠 **Idioma de nombres mezclado** (español/inglés y snake_case/camelCase). Adoptar una convención única.
- [x] 🟠 **`current_path_enum` en minúsculas.** Renombrado a `CurrentPath`. ✅
- [x] 🟡 **`NoteFSOptions` definido y sin usar.** Eliminado de `tree-folder-interfaces.ts`. ✅
- [x] 🟡 **`README.md` era la plantilla por defecto.** Reemplazado por documentación real (descripción, requisitos, scripts, estructura, estado). ✅
- [x] 🟡 **`package.json` sin descripción y scripts mínimos.** Añadidos `description` y scripts `build:dev`, `tauri:dev`, `tauri:build`, `check`. ✅
- [x] 🟡 **`index.html` `<title>Tauri + Angular</title>` y `lang="en"`.** Corregido a `<title>Dorea</title>` y `lang="es"`. ✅
- [ ] 🟡 **Servicios gigantes.** `folder-services.ts` y `main-page.ts` acumulan responsabilidades. Dividir.
- [ ] 🟡 **Lógica DOM imperativa dentro de componentes.** Manipulación directa de `classList`, `document`, `style`. Migrar a `[class]`/signals.
- [x] 🟡 **`CustomRouteReuseStrategy` muerto** en `stratergies/`. Eliminado. ✅
- [x] 🟢 **JSON de idioma duplicado**: `src-tauri/Data/languages/en.json` y `src-tauri/resources/en.json` son idénticos. Ya hay una sola fuente de verdad: `resources/en.json` (vía `include_str!`); `Data/` se genera en arranque y está gitignored. ✅
- [x] 🟢 **`src/assets/angular.svg` y `tauri.svg`** de plantilla sin uso. Eliminados (`src/assets/`). ✅

---

## 6. Diseño / UI (corregir lo arcaico)

- [ ] 🟠 **Sin sistema de diseño.** Colores/espaciados Tailwind sueltos y hardcodeados. Definir tokens en `tailwind.config.js`.
- [x] 🟠 **El tema no persistía.** `ThemeServices` ahora guarda en `localStorage` (`dorea_theme`) y aplica la clase `dark` al iniciar. ✅
- [ ] 🟠 **No existe cambio de idioma.** `LanguageSettings.change_to` y el selector no se usan; `get_language` en Rust siempre lee `en.json`. Implementar o eliminar.
- [ ] 🟠 **Estilos inconsistentes entre componentes.** Unos usan plantilla externa + `<style>`, otros estilos inline. Unificar.
- [ ] 🟠 **`.dark-bg.light-bg` aplicados simultáneamente** en varios sitios, generando conflictos. Usar una única clase semántica.
- [ ] 🟡 **Diálogos y menús sin transiciones/estados.** Añadir animaciones y estados coherentes.
- [ ] 🟡 **Buscador de notas poco pulido.** La barra de scroll se calcula a mano con `style.top/height`; usar scroll nativo.
- [x] 🟡 **Botones como `<a href="#">`** en `bible_option-component.ts`. Convertidos a `<button type="button">` (también en `mark_options-component`, `search_result-component`, `topbar-component` y `notes-page`). ✅
- [ ] 🟡 **Iconografía y tipografía.** Sin fuente base definida. Definir tipografía de lectura y jerarquía.
- [x] 🟡 **Estado vacío poco trabajado.** El texto "Add new note" ahora usa i18n (`notes.add_new_note`). ✅
- [ ] 🟡 **El texto del buscador resaltado usa `innerHTML`.** Migrar a resaltado por componentes. (Mitigado en seguridad: HTML y regex escapados.)
- [ ] 🟡 **Diseño no responsive.** Layouts con anchos fijos. Verificar en 800x600.
- [ ] 🟢 **Colores de resaltado de marcas** hardcodeados en dos lugares; centralizar en constantes.
- [ ] 🟢 **Sin favicon / iconos propios.**
- [x] 🟢 **`notes-page.html` con `-z-20`** en el contenedor raíz (posible residuo sin efecto útil). Eliminado. ✅

---

## 7. Accesibilidad

- [x] 🟠 **Navegación invisible/ambigua**: los `<a href="#">` de `bible_option-component` ahora son `<button>`; los enlaces del sidebar tienen `aria-label`. ✅
- [x] 🟠 **Botones solo con icono sin `aria-label`.** Añadidos en topbar (+, −, buscar), sidebar (biblia, notas, ajustes, tema), notes-page (toggle de versículos) y `search-result` (copiar/citar/ir/cerrar). ✅
- [ ] 🟡 **Contraste**: `text-black/10`, `bg-gray-200/10`, `text-gray-400` pueden incumplir WCAG AA. Revisar paleta.
- [x] 🟡 **Foco**: varios controles eran `<div (click)>`/`<span (click)>`; convertidos a `<button>` nativo con clase `.reset-button` (ítems de menú contextual, muestras de color de marcas, resultados del buscador de notas, navegación por libros y toggle de carpetas). Las filas con inputs anidados usan `tabindex="0"` + `(keydown.enter)`. ESLint exige ahora estas reglas como **error**. ✅
- [ ] 🟡 **Menús contextuales y modales** no atrapan el foco ni cierran con `Escape`. (Hecho: ambos cierran con `Escape` vía `@HostListener('document:keydown.escape')` en `folder-options` y `search-note`. Pendiente: atrapar el foco dentro del modal/menú.)
- [ ] 🟢 **`@HostListener('wheel')`** para zoom con Ctrl no es accesible sin ratón; añadir atajos de teclado.

---

## 8. Rendimiento

- [x] 🟠 **Sin lazy loading de rutas.** `app.routes.ts` ahora usa `loadComponent` (chunks separados por página). ✅
- [x] 🟠 **Suscripciones y listeners sin limpiar.** `main-page.ts` ahora limpia el listener `resize` en `ngOnDestroy` y usa `takeUntilDestroyed` en las dos suscripciones a Subjects. (El `keydown` de `app.component` es del componente raíz y vive toda la sesión.) ✅
- [ ] 🟡 **`marker_services.marks` es un `Map` mutable fuera de signals.** Convertir a signal.
- [ ] 🟡 **`apply_marks()` y render de Biblia** con manipulación de DOM; valorar `track`/`@let`.
- [ ] 🟡 **`index_the_bible`** re-indexa y escribe archivo en cada carga si no existe; cachear por abreviación.
- [x] 🟡 **Búsqueda O(n·m)** con `Vec::contains` para cruzar palabras; optimizada con `HashSet`. ✅
- [x] 🟢 **`app.component` inicializaba servicios en serie.** Los independientes (biblia, idioma, carpetas) van en `Promise.all`; marcas se cargan después (dependen de la biblia). ✅
- [ ] 🟢 **Budget de producción**: el bundle inicial es ~1.79 MB (raw). Revisar (`OnPush`/zoneless, lazy).

---

## 9. Seguridad

- [x] 🟠 **`innerHTML` con `bypassSecurityTrustHtml`** en `search-result-component.ts`. El texto se escapa con `escapeHtml()` antes de resaltar y las palabras de búsqueda se escapan con `escapeRegExp()`, eliminando el XSS/ReDoS. ✅
- [x] 🟠 **`csp: null`** en `src-tauri/tauri.conf.json`. Definida una CSP (`default-src 'self'`, `connect-src` con `ipc:`/`ipc.localhost`/`api.getbible.net`, `style-src 'unsafe-inline'` para Angular). ✅
- [x] 🟡 **Descarga de Biblias desde URL arbitraria.** `download_bible` valida que la URL empiece por `https://api.getbible.net/` antes de descargar. ✅
- [x] 🟡 **Comandos Tauri sin validación de rutas.** Añadido `validate_note_path()` en `directory_handler.rs` (rechaza rutas fuera de `Data/notes` y traversal `..`) aplicado a `save_note`, `get_note`, `delete_note`, `update_file_name` y creación de nota/carpeta. ✅
- [x] 🟢 **`RegExp` construido con `join("|")`** de palabras de usuario; ahora se escapan los metacaracteres. ✅

---

## 10. Configuración, tooling y build

- [x] 🟠 **Gestor de paquetes mezclado.** Unificado en **pnpm** (coincide con `node_modules/.pnpm` y `pnpm-lock.yaml`): `packageManager: pnpm@10.34.5`, scripts y README en pnpm. ✅
- [x] 🟠 **`.gitignore` ignora `pnpm-lock.yaml`** y `src-tauri/Data/`. El lockfile de pnpm ahora se versiona; se ignoran `package-lock.json`/`yarn.lock`. ✅
- [x] 🟠 **Sin linter ni formateador.** Añadidos ESLint 9 (flat config con `angular-eslint`) + Prettier (`.prettierrc`, `.prettierignore`, `.editorconfig`) y scripts `lint`/`lint:fix`/`format`/`format:check`/`rust:fmt`/`rust:clippy`. Backend: `cargo fmt` aplicado y `cargo clippy` limpio. ✅
- [x] 🟠 **`angular.json` con `inlineStyleLanguage: "scss"`** aunque no hay SCSS. Corregido a `css`. ✅
- [ ] 🟡 **`angular.json` sin `test`/`lint`/`e2e`** en `architect`. Añadir las metas.
- [x] 🟡 **Sin scripts de Tauri en `package.json`.** Añadidos `tauri:dev` y `tauri:build`. ✅
- [x] 🟡 **`tsconfig` sin `noUnusedLocals`/`noUnusedParameters`.** Activados en `tsconfig.json`; `tsc -p tsconfig.app.json --noEmit` pasa limpio. ✅
- [ ] 🟡 **Datos de la Biblia:** documentar el esquema esperado (`Bible`/`Book`/`Chapter`/`Verse`) y validarlo.
- [ ] 🟢 **Versiones de `@ng-icons` dispares** (`core` 32.x vs `coolicons`/`material-*` 34.x). Homologar.
- [x] 🟢 **Sin CI** (GitHub Actions) para build Angular + `cargo check`/`clippy`. Añadido `.github/workflows/ci.yml` (frontend: `check`, `lint`, `format:check`, `build` con pnpm; backend: `cargo fmt --check` y `cargo clippy -D warnings`). ✅

---

## 11. Pruebas

- [x] 🟠 **No existe ni un solo test** (`*.spec.ts` = 0) ni tests de Rust. Añadidos tests unitarios de Rust para `get_clean_word`/`clean_phrase` (`bible_handler.rs`) y `validate_note_path` (`directory_handler.rs`): `cargo test --lib` → 5/5 OK. (Frontend y E2E siguen pendientes en los puntos siguientes.) ✅
- [ ] 🟡 **Sin fixtures** para Bible/Notes.
- [ ] 🟡 **Sin tests E2E** (Playwright/WebdriverIO con Tauri).

---

## 12. Documentación

- [x] 🟡 **Reemplazar `README.md`** por documentación propia. Hecho. ✅
- [x] 🟡 Documentar los comandos Tauri (`invoke`) y sus contratos (entrada/salida). Añadido `docs/comandos-tauri.md` con todos los comandos, argumentos, retornos y tipos. ✅
- [ ] 🟢 Añadir `CONTRIBUTING.md` y convenciones de commits/ramas.
- [ ] 🟢 Comentarios: eliminar `TODO/NOTE` obsoletos o convertirlos en issues.

---

## 13. Mejoras opcionales / roadmap

- [ ] 🟡 Migrar a **zoneless change detection** y `ChangeDetectionStrategy.OnPush`.
- [ ] 🟡 Persistir tamaño/estado del sidebar y del buscador.
- [ ] 🟡 Autoguardado de notas (debounce) además de Ctrl+S.
- [ ] 🟡 Búsqueda de notas más robusta (insensible a mayúsculas/acentos, filtro por carpeta).
- [ ] 🟡 Multi-idioma real (selector + carga de `xx.json`).
- [ ] 🟢 Atajos de teclado configurables y panel de ayuda.
- [ ] 🟢 Exportar/importar notas y marcas.
- [ ] 🟢 Actualizaciones automáticas (Tauri updater) y firma de la app.

---

## Checklist rápido de arranque (orden sugerido)

1. [x] Arreglar el error de compilación de Rust (`notes_handler.rs`).
2. [x] Implementar/registrar `save_with_metada` (o volver a `save_note`) y manejar errores.
3. [x] Corregir `apply_marks` (clave por libro) y la deduplicación de marcas.
4. [x] Conectar `disable_resizing` al `mouseup`.
5. [x] Resetear `is_from_link_note`.
6. [x] Arreglar spinners en `settings-page`.
7. [x] Corregir `get_clean_word` (acentos) y `create_new_folder`.
8. [x] Quitar `console.log` y código muerto.
9. [x] Renombrar archivos/carpetas a kebab-case y unificar selectores con prefijo `app-`.
10. [x] Añadir ESLint + Prettier + `cargo clippy` y un test base (Rust).
11. [x] Fusionar `linked_notes.json` con el árbol de notas (marcas al reabrir).
12. [x] Activar `noUnusedLocals`/`noUnusedParameters`.
13. [x] Definir CSP y validar rutas de comandos Tauri.
