mod bible;
mod notes;
mod helpers;
mod settings;

use crate::bible::bible_handler::get_all_bible;
use crate::notes::notes_handler::{create_new_note, save_note, get_notes_folders, 
    get_note, update_file_name, create_new_folder, delete_note};
use crate::helpers::directory_handler::{verify_and_create_data_directory};
use crate::settings::language_handler::{get_language};


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    verify_and_create_data_directory();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_all_bible,
            create_new_note,
            create_new_folder,
            update_file_name,
            save_note,
            delete_note,
            get_language,
            get_notes_folders,
            get_note,
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
