use std::{fs, path::Path, path::PathBuf, sync::OnceLock};

/// Ruta relativa usada en desarrollo (se conserva `Data/` del proyecto).
pub const DATA_PATH: &str = "./Data";

pub const ENGLISH_LANG: &str = include_str!("../../resources/en.json");
pub const DEFAULT_SETTINGS: &str = include_str!("../../resources/default_settings.json");
pub const EXAMPLE_NOTE: &str = include_str!("../../resources/example_note.txt");

/// Directorio raíz de datos resuelto en tiempo de ejecución.
/// En `debug` usa `./Data`; en release usa el directorio de datos de la app.
static DATA_DIR: OnceLock<PathBuf> = OnceLock::new();

/// Resuelve y fija el directorio de datos. Debe llamarse una vez al arrancar.
pub fn init_data_dir(app: &tauri::AppHandle) {
    #[cfg(debug_assertions)]
    {
        let _ = app;
        let _ = DATA_DIR.set(PathBuf::from(DATA_PATH));
    }

    #[cfg(not(debug_assertions))]
    {
        use tauri::Manager;

        if let Ok(dir) = app.path().app_data_dir() {
            let _ = DATA_DIR.set(dir);
        }
    }
}

/// Devuelve el directorio raíz de datos (con fallback a `./Data`).
pub fn data_dir() -> PathBuf {
    DATA_DIR
        .get()
        .cloned()
        .unwrap_or_else(|| PathBuf::from(DATA_PATH))
}

#[tauri::command]
pub fn verify_and_create_data_directory() {
    let bible_path = get_bible_path();
    let note_path = get_note_path();
    let language_path = get_language_path();
    let settings_path = get_settings_path();
    let marks_path = get_mark_path();

    if !Path::new(&data_dir()).exists() {
        let _ = fs::create_dir(data_dir());
    }

    if !Path::new(&language_path).exists() {
        let _ = fs::create_dir(&language_path);
        let _ = fs::write(format!("{}/en.json", language_path), ENGLISH_LANG);
    }

    if !Path::new(&note_path).exists() {
        let _ = fs::create_dir(&note_path);
        let _ = fs::write(format!("{}/example_note.txt", note_path), EXAMPLE_NOTE);
    }

    if !Path::new(&bible_path).exists() {
        let _ = fs::create_dir(&bible_path);
    }

    let setting_file_path = format!("{}/settings.json", settings_path);

    if !Path::new(&settings_path).exists() {
        let _ = fs::create_dir(&settings_path);
    }

    if !Path::new(&setting_file_path).exists() {
        let _ = fs::write(setting_file_path, DEFAULT_SETTINGS);
    }

    if !Path::new(&marks_path).exists() {
        let _ = fs::create_dir(&marks_path);
    }
}

pub fn get_bible_path() -> String {
    data_dir().join("biblies").to_string_lossy().to_string()
}

pub fn get_note_path() -> String {
    data_dir().join("notes").to_string_lossy().to_string()
}

pub fn get_language_path() -> String {
    data_dir().join("languages").to_string_lossy().to_string()
}

pub fn get_settings_path() -> String {
    data_dir().join("settings").to_string_lossy().to_string()
}

pub fn get_mark_path() -> String {
    data_dir().join("marks").to_string_lossy().to_string()
}

/// Valida que una ruta (archivo o carpeta) esté dentro del directorio de notas.
/// Rechaza rutas externas y traversal con `..`.
pub fn validate_note_path(dir: &str) -> Result<(), String> {
    let base = get_note_path().replace('\\', "/");
    let target = dir.replace('\\', "/");
    let base_clean = base.trim_end_matches('/');

    let has_traversal = target.split('/').any(|part| part == "..");

    if has_traversal {
        return Err(format!("Ruta no permitida (traversal): {}", dir));
    }

    if target == base_clean || target.starts_with(&format!("{}/", base_clean)) {
        Ok(())
    } else {
        Err(format!("Ruta no permitida (fuera de notas): {}", dir))
    }
}

#[cfg(test)]
mod tests {
    use super::validate_note_path;

    #[test]
    fn acepta_rutas_dentro_de_notas() {
        assert!(validate_note_path("./Data/notes").is_ok());
        assert!(validate_note_path("./Data/notes/carpeta/nota.txt").is_ok());
    }

    #[test]
    fn rechaza_traversal() {
        assert!(validate_note_path("./Data/notes/../../etc/passwd").is_err());
        assert!(validate_note_path("../secreto").is_err());
    }

    #[test]
    fn rechaza_rutas_fuera_de_notas() {
        assert!(validate_note_path("./Data/settings/settings.json").is_err());
        assert!(validate_note_path("/etc/passwd").is_err());
    }
}
