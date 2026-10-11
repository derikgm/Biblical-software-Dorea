mod bible;
mod helpers;
mod notes;
mod settings;

use crate::bible::bible_handler::{
    get_all_bible, get_available_list_of_bibles, get_local_bibles, save_available_list_of_bibles,
    save_bible, search_in_bible, IndexedBible,
};
use crate::bible::marker_handler::{get_marks, save_mark};
use crate::helpers::directory_handler::{init_data_dir, verify_and_create_data_directory};
use crate::notes::notes_handler::{
    create_new_folder, create_new_note, delete_note, get_note, get_notes_folders, save_linked_mark,
    save_note, update_file_name,
};
use crate::settings::language_handler::get_language;
use crate::settings::settings_handler::{get_settings, save_settings};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(IndexedBible::default())
        .setup(|app| {
            init_data_dir(app.handle());
            verify_and_create_data_directory();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_all_bible,
            save_bible,
            save_linked_mark,
            save_mark,
            save_available_list_of_bibles,
            get_available_list_of_bibles,
            create_new_note,
            get_local_bibles,
            get_marks,
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
