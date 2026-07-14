use std::fs;
use serde::{Deserialize, Serialize};

use crate::helpers::directory_handler::NOTES_PATH;
use crate::helpers::directory_handler::verify_and_create_data_directory;

#[tauri::command]
pub fn delete_note(id: u32) -> Result<bool, String>{

    let notes_directory = fs::read_dir(NOTES_PATH)
    .map_err(|e| format!("Error de lectura de notas: {e}"))?;

    for note_file in notes_directory {
        if let Ok(nota) = note_file {

            // let value_3: &str = nota
            // .file_name()
            // .to_str()
            // .unwrap()
            // .split("_")
            // .map(|v| v)
            // .collect::<Vec<&str>>()
            // .get(1)
            // .unwrap();


            // if value_3.to_string() == id.to_string() {
            //     println!("Encontrado en: {}", value_3);
            // }
            
        }
    }

    Ok(true)
}

#[tauri::command]
pub fn save_note (note: Note) -> Result<bool, String>{

    verify_and_create_data_directory();

    let note_json = serde_json::to_string(&note)
        .map_err(|e| format!("Error de parseo de Json: {e}"))?;

    fs::write(format!("{}/note_{}_{}.json", NOTES_PATH, note.id, note.title), note_json)
        .map_err(|e| format!("Error de guardado de datos: {e}"))?;

    Ok(true)
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Note{
    id: u32,
    title: String,
    text: String,
}