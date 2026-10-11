# Comandos Tauri (puente frontend ⇄ backend Rust)

El frontend invoca estos comandos con `@tauri-apps/api/core` → `invoke<T>("nombre", payload)`.
El backend los expone con `#[tauri::command]` y los registra en `src-tauri/src/lib.rs`
(`tauri::generate_handler![...]`).

Convención de errores: los comandos devuelven `Result<T, String>`, donde el `String` es un
mensaje de error legible. Los `Option<T>` indican "sin resultado" (p. ej. búsqueda vacía).

> Todos los comandos reciben payloads JSON. Los `tauri::State<IndexedBible>` son estado en
> memoria gestionado por Tauri; **no** se envían desde el frontend.

## Biblia (`src/bible/bible_handler.rs`)

| Comando | Argumentos | Retorno | Descripción |
| --- | --- | --- | --- |
| `get_all_bible` | `bible: String` | `Bible` | Carga una biblia local (por nombre) e indexa sus palabras/versículos en memoria. |
| `search_in_bible` | `search: String` | `Option<Vec<IndexedVerse>>` | Busca una frase en la biblia indexada; `None` si no hay resultados. |
| `get_local_bibles` | — | `Vec<String>` | Lista los nombres de biblia disponibles en `biblies/`. |
| `save_bible` | `bible: Bible` | `()` | Persiste una biblia descargada en `biblies/`. |
| `get_available_list_of_bibles` | — | `Vec<ShortBible>` | Devuelve el catálogo de biblias descargables guardado localmente. |
| `save_available_list_of_bibles` | `bibles: Vec<ShortBible>` | `()` | Guarda el catálogo de biblias descargables. |

## Marcas / resaltados (`src/bible/marker_handler.rs`)

| Comando | Argumentos | Retorno | Descripción |
| --- | --- | --- | --- |
| `get_marks` | `bible: String` | `Vec<Mark>` | Lee las marcas de una biblia y las indexa en memoria. |
| `save_mark` | `mark: Mark, bible: String` | `()` | Guarda/actualiza una marca en la biblia indicada. |

## Notas (`src/notes/notes_handler.rs`)

Todas las rutas pasan por `validate_note_path()` (rechaza traversal y rutas fuera de `notes/`).

| Comando | Argumentos | Retorno | Descripción |
| --- | --- | --- | --- |
| `get_notes_folders` | — | `Folder` | Devuelve el árbol completo de notas/carpetas (fusiona `linked_notes.json`). |
| `get_note` | `dir: String` | `String` | Lee el contenido de una nota. |
| `save_note` | `dir: String, content: String` | `bool` | Escribe el contenido de una nota. |
| `update_file_name` | `dir: String, new_dir: String` | `bool` | Renombra una nota/carpeta. |
| `create_new_note` | `dir: String, title: String, extension: String` | `Note` | Crea una nota nueva y devuelve su nodo. |
| `create_new_folder` | `dir: String, folder: String` | `String` | Crea una carpeta (añade ` (N)` si ya existe) y devuelve el nombre final. |
| `delete_note` | `dir: String, is_dir: bool` | `bool` | Borra una nota o carpeta (recursivo si `is_dir`). |
| `save_linked_mark` | `note: Note` | `()` | Vincula una marca de biblia a una nota y persiste `linked_notes.json`. |

## Ajustes e idioma (`src/settings/`)

| Comando | Argumentos | Retorno | Descripción |
| --- | --- | --- | --- |
| `get_settings` | — | `Settings` | Lee `settings/settings.json`. |
| `save_settings` | `settings: Settings` | `bool` | Persiste los ajustes. |
| `get_language` | — | `LanguageSettings` | Lee el idioma activo (`languages/*.json`). |

## Utilidades (`src/helpers/directory_handler.rs`)

| Comando | Argumentos | Retorno | Descripción |
| --- | --- | --- | --- |
| `verify_and_create_data_directory` | — | `()` | Crea el árbol `Data/` (biblies, notes, languages, settings, marks) y siembra archivos por defecto. |

## Tipos principales

- `Bible`, `ShortBible`, `IndexedVerse`
- `Mark`
- `Note`, `Folder`
- `Settings`, `LanguageSettings`

Definidos en los módulos correspondientes con `serde::{Serialize, Deserialize}`; sus campos se
serializan en `camelCase`/`snake_case` según los atributos del tipo.

## Directorio de datos

`DATA_PATH` se resuelve en arranque mediante `init_data_dir()`:

- **Desarrollo (`debug`)**: `./Data` (dentro del proyecto).
- **Producción (`release`)**: directorio de datos de la app (`app_data_dir()` de Tauri).
