use std::{fs, path::Path};
use serde::{Deserialize, Serialize};
use crate::{bible::bible_handler::IndexedBible, helpers::directory_handler::get_mark_path};

#[tauri::command]
pub fn get_marks (bible: String, state: tauri::State<IndexedBible>) -> Result<Vec<Mark>, String> {
    let mark_json_path = format!("{}/{}.json", get_mark_path(), bible);
    let mut vec_mark: Vec<Mark> = Vec::new();

    let mut marks= state.marks.lock().unwrap();

    if Path::new(&mark_json_path).exists() {

        let marks_json_file = fs::read_to_string(mark_json_path)
        .map_err(|e| format!("Error de lectura de Json: {e}"))?;
        
        vec_mark = serde_json::from_str(&marks_json_file)
        .map_err(|e| format!("Error al parsear el Json: {e}"))?;
    }
    
    marks.clear();

    println!("{:?}", marks);

    for mark in vec_mark.iter() {
        marks.push(mark.clone());
    }

    // marks.sort();

    Ok(vec_mark)
}

#[tauri::command]
pub fn save_mark (mark: Mark, bible: String, state: tauri::State<IndexedBible>) -> Result<(), String> {
    let mark_json_path = format!("{}/{}.json", get_mark_path(), bible);
    let mut marks = state.marks.lock().unwrap();

    marks.push(mark);

    let mark_to_string = marks.clone();

    let mark_string = serde_json::to_string(&mark_to_string)
    .map_err(|e| format!("Error al parsear el Json: {e}"))?;

    let _ = fs::write(mark_json_path, mark_string)
    .map_err(|e| format!("Error de escritura de Json: {e}"))?;

    Ok(())
}

#[derive(Serialize, Deserialize, Clone, Copy, Debug)]
pub struct Mark {
    style: u32,
    start: u32,
    end: u32,
    book: u32,
    chapter: u32,
    start_verse: u32,
    end_verse: u32,
}