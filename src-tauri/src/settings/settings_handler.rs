use std::fs;

use serde::{Deserialize, Serialize};

use crate::helpers::directory_handler::SETTINGS_PATH;

#[tauri::command]
pub fn get_settings() -> Result<Settings, String>{

    let settings_string = fs::read_to_string(format!("{}/settings.json", {SETTINGS_PATH}))
    .map_err(|e| format!("Error leyendo el archivo de opciones: {e}"))?;

    let settings_json: Settings = serde_json::from_str(&settings_string)
    .map_err(|e| format!("Error parseando el Json: {e}"))?;

    Ok(settings_json)
}

#[tauri::command]
pub fn save_settings(settings: Settings) -> Result<bool, String>{

    let settings_string = serde_json::to_string(&settings)
    .map_err(|e| format!("Error parseando el json: {e}"))?;

    let _ = fs::write(format!("{}/settings.json", SETTINGS_PATH), settings_string)
    .map_err(|e| format!("Error escribiendo el json: {e}"))?;

    Ok(true)
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Settings {
    font_size: u32,
    bible_form_lineal: bool, 
}