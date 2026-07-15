use std::io::{Read, BufReader};
use std::fs::{self, File};

use crate::{helpers::directory_handler::BIBLIES_PATH, verify_and_create_data_directory};

#[tauri::command]
pub fn get_all_bible() -> Result<Bible, String> {
    verify_and_create_data_directory();

    let bible_str = fs::read_to_string(format!("{}/{}", BIBLIES_PATH, "valera.json"))
    .map_err(|e| format!("Error al leer la biblia: {e}"))?;

    let bible: Bible = serde_json::from_str(&bible_str)
    .map_err(|e| format!("Error de parseo de datos: {e}"))?;

    Ok(bible)
}

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Bible {
    pub translation: String,
    pub abbreviation: String,
    pub description: String,
    pub lang: String,
    pub language: String,
    pub direction: String, // "LTR" o "RTL"
    pub encoding: String,
    pub books: Vec<Book>,
    // campos de distribución (opcionales)
    #[serde(default)]
    pub distribution_lcsh: Option<String>,
    #[serde(default)]
    pub distribution_version: Option<String>,
    #[serde(default)]
    pub distribution_version_date: Option<String>,
    #[serde(default)]
    pub distribution_abbreviation: Option<String>,
    #[serde(default)]
    pub distribution_about: Option<String>,
    #[serde(default)]
    pub distribution_license: Option<String>,
    #[serde(default)]
    pub distribution_sourcetype: Option<String>,
    #[serde(default)]
    pub distribution_source: Option<String>,
    #[serde(default)]
    pub distribution_versification: Option<String>,
    #[serde(default)]
    pub distribution_history: Option<HashMap<String, String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Book {
    pub nr: u32,
    pub name: String,
    pub chapters: Vec<Chapter>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Chapter {
    pub chapter: u32,
    pub name: String,
    pub verses: Vec<Verse>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Verse {
    pub chapter: u32,
    pub verse: u32,
    pub name: String,
    pub text: String,
}