use std::{fs, path::Path, fs::ReadDir};
use std::fs::File;
use serde::{Deserialize, Serialize};

use crate::bible::bible_handler::IndexedBible;
use crate::{bible::bible_handler::IndexedVerse, helpers::directory_handler::get_note_path};

#[tauri::command]
pub fn save_note (dir: &str, content: &str) -> Result<bool, String> {
    let _ = fs::write(dir, content)
    .map_err(|e| {format!("ocurrio un error de escritura: {e}")})?;

    Ok(true)
}

#[tauri::command]
pub fn update_file_name (dir: &str, new_dir: &str) -> Result<bool, String> {

    let _ = fs::rename(dir, new_dir)
    .map_err(|e| format!("Error renonbrando: {e}"))?;

    Ok(true)
}

#[tauri::command]
pub fn create_new_note (dir: &str, title: String, extension: String) -> Result<Note, String>{
    let mut note: Note = Note { title, extension, linked_verses: Vec::new()};
    let mut files: Vec<String> = Vec::new();

    let folder_dir = fs::read_dir(dir)
    .map_err(|e| format!("Error de lectura de carpeta: {e}"))?;

    for content in folder_dir {
        let content = content
        .map_err(|e| format!("Error de navegacion: {e}"))?;

        let path_buf = content.path();

        if path_buf.is_file(){
            if let Some(file_name) = path_buf.file_name() {
                files.push(file_name.to_str().unwrap().to_string());
            }
        }
    }

    let mut cont:u32 = 1;
    
    loop {
        let mut continued_while = false;

        for file in &files {
            if *file == format!("{}.{}", note.title, note.extension) {
                cont += 1;
                note = Note { 
                    title: format!("{}_{}", file, cont), 
                    extension: note.extension,
                    linked_verses: Vec::new(), 
                };
                continued_while = true;
                break;
            }
        }

        if !continued_while {break;}
    }

    let _ = File::create(format!("{}/{}.{}", dir, note.title, note.extension))
    .map_err(|e| format!("Error de creacion de archivo: {e}"))?;

    Ok(note)
}

#[tauri::command]
pub fn create_new_folder (dir: &str, folder: String) -> Result<String, String>{
    let mut new_folder: String = String::from(folder);
    let mut folders: Vec<String> = Vec::new();

    let folder_dir = fs::read_dir(dir)
    .map_err(|e| format!("Error de lectura de carpeta: {e}"))?;

    for content in folder_dir {
        let content = content
        .map_err(|e| format!("Error de navegacion: {e}"))?;

        let path_buf = content.path();

        if path_buf.is_dir(){
            if let Some(file_name) = path_buf.file_name() {
                folders.push(file_name.to_str().unwrap().to_string());
            }
        }
    }

    let mut cont:u32 = 1;
    
    loop {
        let mut continued_while = false;

        for file in &folders {
            if *file == format!("{}", new_folder) {
                cont += 1;
                new_folder = format!("new folder ({})", cont);
                continued_while = true;
                break;
            }
        }

        if !continued_while {break;}
    }

    let _ = fs::create_dir(format!("{}/{}", dir, new_folder))
    .map_err(|e| format!("Error en la creacion nueva carpeta: {e}"));

    Ok(new_folder)
}

#[tauri::command]
pub fn get_note (dir: &str) -> Result<String, String>{
    let note_content = fs::read_to_string(dir)
    .map_err(|e| format!("No se pudo leer el elemento: {e}"))?;

    Ok(note_content)
}

#[tauri::command]
pub fn delete_note (dir: &str, is_dir: bool) -> Result<bool, String> {

    if is_dir {
        let _ = fs::remove_dir_all(dir)
        .map_err(|e| format!("Error borrando un archivo: {e}"))?;
    } else {
        let _ = fs::remove_file(dir)
        .map_err(|e| format!("Error borrando un archivo: {e}"))?;
    }

    Ok(true)
}

#[tauri::command]
pub fn get_notes_folders(state: tauri::State<IndexedBible>) -> Result<Folder, String>{

    let root_folder: Folder;
    let linked_notes_path = format!("{}/linked_notes.json", get_note_path());

    let mut notes = state.notes.lock().unwrap();

    let iterator: ReadDir = fs::read_dir(get_note_path())
    .map_err(|e| format!("Error la leer los datos: {e}"))?;

    root_folder = surf_folders2(iterator, get_note_path(), String::from("root"))
    .map_err(|e| format!("{}", e))?;

    if Path::new(&linked_notes_path).exists() {
        //...
    }

    Ok(root_folder)
}

//TODO: arreglar esto
fn surf_folders2 (read_dir: ReadDir, dir: String, folder_name: String) -> Result<Folder, String> {
    let mut files: Vec<Note> = Vec::from([]); 
    let mut folders: Vec<Folder> = Vec::from([]);

    for entry in read_dir {
        let entry = entry
        .map_err(|e| format!("Error de lectura: {e}"))?;

        let surf_path_buf = entry.path();

        if surf_path_buf.is_dir() {
            if let (Some(path_str), Some(path_prefix)) = (surf_path_buf.to_str(), surf_path_buf.file_prefix()) {

                let read_folder_dir = fs::read_dir(path_str)
                .map_err(|e| format!("Error de lectura: {e}"))?;
    
                let folder = surf_folders2(
                    read_folder_dir,
                    path_str.to_string().replace("\\", "/"),
                    path_prefix.to_str().unwrap().to_string(),
                )
                .map_err(|e| format!("Error de navegacion de carpetas: {e}"))?;
    
                folders.push(folder);
            }
        }

        if surf_path_buf.is_file() {
            if let (Some(prefix), Some(extension)) = (surf_path_buf.file_prefix(), surf_path_buf.extension()) {
                if extension == "txt" {
                    files.push( Note { 
                        title: prefix.to_str().unwrap().to_string(), 
                        extension: extension.to_str().unwrap().to_string(),
                        linked_verses: Vec::new(),
                    });
                }
            } 
        }
    }

    Ok(Folder { 
        dir,
        folder_name, 
        open: false, 
        folders, 
        files
    })
    
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Note {
    title: String,
    extension: String,
    linked_verses: Vec<IndexedVerse>
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Folder {
    folder_name: String,
    dir: String,
    open: bool,
    folders: Vec<Folder>,
    files: Vec<Note>,
}
