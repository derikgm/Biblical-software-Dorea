use std::{fs, path::Path};

pub const DATA_PATH: &str = "../../Data";

pub const ENGLISH_LANG: &str = include_str!("../../resources/en.json");
pub const DEFAULT_SETTINGS: &str = include_str!("../../resources/default_settings.json");
pub const EXAMPLE_NOTE: &str = include_str!("../../resources/example_note.txt");

#[tauri::command]
pub fn verify_and_create_data_directory(){

    let bible_path = &get_bible_path();
    let note_path = &get_note_path();
    let language_path = &get_language_path();
    let settings_path = &get_settings_path();

    if !Path::new(DATA_PATH).exists() {
        let _ = std::fs::create_dir("./Data");
    }        

    if !Path::new(language_path).exists() {
        let _ = std::fs::create_dir(language_path);
        let _ = fs::write(format!("{}/en.json", language_path), ENGLISH_LANG);
    }
    
    if !Path::new(note_path).exists() {
        let _ = std::fs::create_dir(note_path);
        println!("{:?}", EXAMPLE_NOTE);
        let _ = fs::write(format!("{}/example_note.txt", note_path), EXAMPLE_NOTE);
    }

    if !Path::new(bible_path).exists() {
        let _ = std::fs::create_dir(bible_path);
    }

    if !Path::new(settings_path).exists() {
        let _ = std::fs::create_dir(settings_path);
        let _ = fs::write(format!("{}/settings.json", settings_path), DEFAULT_SETTINGS);
    }
}

pub fn get_bible_path () -> String {
    return DATA_PATH.to_owned() + "/biblies" 
}

pub fn get_note_path () -> String {
    return DATA_PATH.to_owned() + "/notes" 
}

pub fn get_language_path () -> String {
    return DATA_PATH.to_owned() + "/languages" 
}

pub fn get_settings_path () -> String {
    return DATA_PATH.to_owned() + "/settings" 
}

