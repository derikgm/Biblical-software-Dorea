
use std::fs;

use serde::{Deserialize, Serialize};

use crate::helpers::directory_handler::{LANGUAGES_PATH, verify_and_create_data_directory};

#[tauri::command]
pub fn get_language() -> Result<LanguageSettings, String>{
    verify_and_create_data_directory();

    let langauge_file_string = fs::read_to_string(format!("{}/{}", LANGUAGES_PATH, "en.json"))
    .map_err(|e| format!("Ocurrio un error de lectura de lenguages: {e}"))?;

    let language: LanguageSettings = serde_json::from_str(&langauge_file_string)
    .map_err(|e| format!("Ocurrio un error de parseo de datos: {e}"))?;

    Ok(language)
}

#[derive(Deserialize, Serialize, Debug)]
pub struct LanguageSettings {
    change_to: ChangeToOptions,
    folder: FolderOptions,
    notes: NoteOptions,
    close: String
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
}