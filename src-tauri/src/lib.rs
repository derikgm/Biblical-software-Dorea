mod bible;
mod notes;
mod helpers;
mod settings;

use crate::bible::bible_handler::get_all_bible;
use crate::notes::notes_handler::{create_new_note, save_note, get_notes_folders, get_note};
use crate::helpers::directory_handler::{verify_and_create_data_directory};
use crate::settings::language_handler::{get_language, save_language_settings};


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    verify_and_create_data_directory();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_all_bible,
            create_new_note,
            save_note,
            get_language,
            save_language_settings,
            get_notes_folders,
            get_note,
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
