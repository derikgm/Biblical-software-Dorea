use serde::{Deserialize, Serialize};
use std::path::Path;
use std::collections::HashMap;
use std::fs::{self};

use crate::{helpers::directory_handler::BIBLIES_PATH, verify_and_create_data_directory};

#[tauri::command]
pub fn get_all_bible() -> Result<Bible, String> {
    verify_and_create_data_directory();

    let bible_str = fs::read_to_string(format!("{}/{}", BIBLIES_PATH, "valera.json"))
    .map_err(|e| format!("Error al leer la biblia: {e}"))?;

    let bible: Bible = serde_json::from_str(&bible_str)
    .map_err(|e| format!("Error de parseo de datos: {e}"))?;

    let _ = index_the_bible(&bible)?;

    Ok(bible)
}

fn index_the_bible (bible: &Bible) -> Result<(), String>{
    let path = format!("{}/indexed/valera_indexed.json", BIBLIES_PATH);

    if Path::new(&path).exists() {

        let indexed_bible = fs::read_to_string(path)
        .map_err(|e| format!("Error al leer la biblia indexada: {e}"))?;

    } else {
        let mut cont: usize = 0;
        let mut list_verses: HashMap<usize, String> = HashMap::from([]);
        let mut words_indexed: HashMap<String, Vec<usize>> = HashMap::from([]);

        bible.books.iter().for_each(|b| {
            b.chapters.iter().for_each(|c| {
                c.verses.iter().for_each(|v| {
                    list_verses.insert(cont, v.text.clone());
                    cont += 1;

                    v.text.split(" ").collect::<Vec<&str>>().iter_mut().for_each(|vs| {
                        let verse_string = get_clean_word(vs);

                        match words_indexed.get_mut(&verse_string) {
                            Some(index) => {
                                index.push(cont);
                            },
                            None => {
                                words_indexed.insert(verse_string, Vec::from([cont]));
                            },
                        }
                    });
                });
            });
        });

        let indexed_bible: IndexedBible = IndexedBible {
            verses: list_verses,
            words: words_indexed,
        };

        let indexed_bible_json = serde_json::to_string(&indexed_bible)
        .map_err(|e| format!("Error de parseo de biblia indexada: {e}"))?;

        let _ = fs::write(path, indexed_bible_json)
        .map_err(|e| format!("Error guardando la biblia indexada: {e}"));

    }

    Ok(())
}

fn get_clean_word (word: &str) -> String{
    let final_string: String = word
    .to_string()
    .chars()
    .filter(|c| c.is_alphabetic())
    .map(|c| {
        match c {
            'á' => 'a',
            'é' => 'a',
            'í' => 'a',
            'ó' => 'a',
            'ú' => 'a',
            'Á' => 'a',
            'É' => 'a',
            'Í' => 'a',
            'Ó' => 'a',
            'Ú' => 'a',
            _ => c,
        }
    })
    .collect();

    final_string.to_lowercase()
}

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

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexedBible {
    verses: HashMap<usize, String>,
    words: HashMap<String, Vec<usize>>,
}