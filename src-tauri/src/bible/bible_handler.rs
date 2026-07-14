use std::io::{Read, BufReader};
use std::fs::File;

use crate::{helpers::directory_handler::BIBLIES_PATH, verify_and_create_data_directory};

#[tauri::command]
pub fn get_all_bible() -> Result<(), String> {
    verify_and_create_data_directory();

    println!("Funcionando");

    Ok(())
}
