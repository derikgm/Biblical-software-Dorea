use std::path::Path;

pub const BIBLIES_PATH: &str = "./Data/biblies";
// pub const NOTES_PATH: &str = "./Data/notes";
pub const NOTES_PATH: &str = "../../Data/notes";
pub const LANGUAGES_PATH: &str = "./Data/languages";

pub fn verify_and_create_data_directory(){

    if !Path::new("./Data").exists() {
        let _ = std::fs::create_dir("./Data");
    }        

    if !Path::new(BIBLIES_PATH).exists() {
        let _ = std::fs::create_dir(BIBLIES_PATH);
    }

    if !Path::new(NOTES_PATH).exists() {
        let _ = std::fs::create_dir(NOTES_PATH);
    }

    if !Path::new(LANGUAGES_PATH).exists() {
        let _ = std::fs::create_dir(LANGUAGES_PATH);
    }
}
