use std::fs;
use std::fs::File;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};

use crate::helpers::directory_handler::NOTES_PATH;
use crate::helpers::directory_handler::verify_and_create_data_directory;

#[tauri::command]
pub fn save_note (dir: &str, content: &str) -> Result<bool, String> {

    println!("{:?} - {:?}", dir, content);

    let _ = fs::write(dir, content)
    .map_err(|e| format!("ocurrio un error de escritura: {e}"))?;

    Ok(true)
}

#[tauri::command]
pub fn create_new_note (dir: &str) -> Result<Note, String>{
    verify_and_create_data_directory();

    let extension = String::from("txt");
    let mut note: Note = Note { title: "note_1".to_string(), extension };
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
                note = Note { title: format!("note_{}", cont), extension: note.extension };
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
pub fn get_note (dir: &str) -> Result<String, String>{
    let note_content = fs::read_to_string(dir)
    .map_err(|e| format!("No se pudo leer el elemento: {e}"))?;

    Ok(note_content)
}

#[tauri::command]
pub fn get_notes_folders() -> Result<Folder, String>{
    verify_and_create_data_directory();

    let mut root_files: Vec<Note> = Vec::from([]); 
    let mut root_folders: Vec<Folder> = Vec::from([]); 

    let iterator = fs::read_dir(NOTES_PATH)
    .map_err(|e| format!("Error la leer los datos: {e}"))?;

    for entry in iterator {
        let entry = entry
        .map_err(|e| format!("Error de lectura: {e}"))?;

        let path_buf = entry.path();

        if path_buf.is_dir() {
            let folder = surf_folders(&path_buf)
            .map_err(|e| format!("Error de navegacion de carpetas: {e}"))?;

            root_folders.push(folder);
        }

        if path_buf.is_file() {
            if let (Some(prefix), Some(extension)) = (path_buf.file_prefix(), path_buf.extension()) {
                if extension == "txt" {
                    root_files.push( Note { 
                        title: prefix.to_str().unwrap().to_string(), 
                        extension: extension.to_str().unwrap().to_string()
                    });
                }
            } 
        }
    }

    let root_folder: Folder = Folder { 
        dir: String::from(NOTES_PATH),
        folder_name: String::from("root"), 
        open: false, 
        folders: root_folders, 
        files: root_files
    };

    Ok(root_folder)

}

fn surf_folders(path_buf: &PathBuf) -> Result<Folder, String> {
    let mut files: Vec<Note> = Vec::from([]); 
    let mut folders: Vec<Folder> = Vec::from([]);

    let iterator = fs::read_dir(path_buf.as_path())
    .map_err(|e| format!("Error la leer los datos: {e}"))?;

    for entry in iterator {
        let entry = entry
        .map_err(|e| format!("Error de lectura: {e}"))?;

        let surf_path_buf = entry.path();

        if surf_path_buf.is_dir() {
            let folder = surf_folders(&surf_path_buf)
            .map_err(|e| format!("Error de navegacion de carpetas: {e}"))?;

            folders.push(folder);
        }

        if surf_path_buf.is_file() {
            if let (Some(prefix), Some(extension)) = (surf_path_buf.file_prefix(), surf_path_buf.extension()) {
                if extension == "txt" {
                    files.push( Note { 
                        title: prefix.to_str().unwrap().to_string(), 
                        extension: extension.to_str().unwrap().to_string()
                    });
                }
            } 
        }
    }


    let folder: Folder = Folder { 
        dir: path_buf.to_str().unwrap().replace("\\", "/").to_string(),
        folder_name: path_buf.file_name().unwrap().to_str().unwrap().to_string(), 
        open: false, 
        folders, 
        files
    };

    Ok(folder)
    
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Note {
    title: String,
    extension: String
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Folder {
    folder_name: String,
    dir: String,
    open: bool,
    folders: Vec<Folder>,
    files: Vec<Note>,
}

#[derive(Deserialize, Serialize, Debug)]
pub enum NoteFSOptions {
    CreateNewNote,
    CreateNewFolder,
}