mod bible;
mod notes;
mod helpers;
mod settings;

use crate::bible::bible_handler::{get_all_bible, IndexedBible, search_in_bible};
use crate::notes::notes_handler::{create_new_note, save_note, get_notes_folders, 
    get_note, update_file_name, create_new_folder, delete_note};
use crate::helpers::directory_handler::{verify_and_create_data_directory};
use crate::settings::language_handler::{get_language};
use crate::settings::settings_handler::{get_settings, save_settings};


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    verify_and_create_data_directory();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(IndexedBible::default())
        .invoke_handler(tauri::generate_handler![
            get_all_bible,
            create_new_note,
            create_new_folder,
            update_file_name,
            search_in_bible,
            save_note,
            delete_note,
            get_settings,
            save_settings,
            get_language,
            get_notes_folders,
            get_note,
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
