use std::fs;

use serde::{Deserialize, Serialize};

use crate::helpers::directory_handler::get_language_path;

#[tauri::command]
pub fn get_language() -> Result<LanguageSettings, String> {
    let language_file_string = fs::read_to_string(format!("{}/{}", get_language_path(), "en.json"))
        .map_err(|e| format!("Ocurrio un error de lectura de lenguages: {e}"))?;

    let language: LanguageSettings = serde_json::from_str(&language_file_string)
        .map_err(|e| format!("Ocurrio un error de parseo de datos: {e}"))?;

    Ok(language)
}

#[derive(Deserialize, Serialize, Debug)]
pub struct LanguageSettings {
    change_to: ChangeToOptions,
    folder: FolderOptions,
    notes: NoteOptions,
    close: String,
    bible_empty: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct ChangeToOptions {
    option_name: String,
    row: String,
    lineal: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct FolderOptions {
    create_new_folder: String,
    create_new_note: String,
    change_name: String,
    delete: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct NoteOptions {
    file_empty: String,
    #[serde(default)]
    no_linked_verse: String,
    #[serde(default)]
    add_new_note: String,
}
