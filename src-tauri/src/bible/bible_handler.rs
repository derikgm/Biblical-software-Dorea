use serde::{Deserialize, Serialize};
use serde_json::json;
use std::path::Path;
use std::collections::HashMap;
use std::fs::{self};
use std::sync::Mutex;

use crate::{helpers::directory_handler::BIBLIES_PATH, verify_and_create_data_directory};

#[tauri::command]
pub fn get_all_bible(state: tauri::State<IndexedBible>) -> Result<Bible, String> {
    verify_and_create_data_directory();

    let bible_str = fs::read_to_string(format!("{}/{}", BIBLIES_PATH, "valera.json"))
        .map_err(|e| format!("Error al leer la biblia: {e}"))?;

    let bible: Bible = serde_json::from_str(&bible_str)
        .map_err(|e| format!("Error de parseo de datos: {e}"))?;

    // Indexar la biblia (esto carga o crea el índice)
    let _ = index_the_bible(&bible, &state)?;

    Ok(bible)
}

fn index_the_bible(bible: &Bible, state: &tauri::State<IndexedBible>) -> Result<(), String> {
    let path = format!("{}/indexed/valera_indexed.json", BIBLIES_PATH);

    // Verificar si el archivo indexado ya existe
    if Path::new(&path).exists() {
        // CARGAR desde el archivo existente
        let indexed_str = fs::read_to_string(&path)
            .map_err(|e| format!("Error al leer la biblia indexada: {e}"))?;
        
        let indexed_data: SerialisableIndexedBible = serde_json::from_str(&indexed_str)
            .map_err(|e| format!("Error al parsear biblia indexada: {e}"))?;

        let mut list_verses = state.verses.lock().unwrap();
        let mut words_indexed = state.words.lock().unwrap();

        list_verses.clear();
        words_indexed.clear();

        for (index, indexed_verse) in indexed_data.verses {
            list_verses.insert(index, indexed_verse);
        };

        for (k, v) in indexed_data.words {
            words_indexed.insert(k, v);
        }

    } else {
        
        let mut list_verses = state.verses.lock().unwrap();
        let mut words_indexed = state.words.lock().unwrap();
        
        let mut cont: usize = 1; // Empezar desde 1 para que coincida con los números de versículo

        bible.books.iter().for_each(|b| {
            b.chapters.iter().for_each(|c| {
                c.verses.iter().for_each(|v| {
                    // Guardar el texto del versículo
                    list_verses.insert(cont, IndexedVerse { 
                        book_number: b.nr,
                        chapter_number: v.chapter,
                        verse_number: v.verse,
                        verse_string: v.name.clone(),
                    });

                    // Indexar cada palabra
                    v.text.split_whitespace().for_each(|word| {
                        let clean_word = get_clean_word(word);
                        
                        if !clean_word.is_empty() {
                            words_indexed
                                .entry(clean_word)
                                .or_insert_with(Vec::new)
                                .push(cont);
                        }
                    });

                    cont += 1;
                });
            });
        });

        // Guardar el índice en archivo
        let indexed_bible = json!({
            "verses": *list_verses,
            "words": *words_indexed
        });

        let indexed_bible_json = serde_json::to_string_pretty(&indexed_bible)
            .map_err(|e| format!("Error de parseo de biblia indexada: {e}"))?;

        // Crear directorio si no existe
        if let Some(parent) = Path::new(&path).parent() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Error creando directorio: {e}"))?;
        }

        fs::write(&path, indexed_bible_json)
            .map_err(|e| format!("Error guardando la biblia indexada: {e}"))?;


        println!("{:?}", indexed_bible);
    }

    Ok(())
}

fn get_clean_word(word: &str) -> String {
    word.chars()
        .filter(|c| c.is_alphabetic())
        .map(|c| {
            match c {
                'á' | 'é' | 'í' | 'ó' | 'ú' => 'a',
                'Á' | 'É' | 'Í' | 'Ó' | 'Ú' => 'a',
                _ => c,
            }
        })
        .collect::<String>()
        .to_lowercase()
}

#[tauri::command]
pub fn search_in_bible(search: String, state: tauri::State<IndexedBible>) -> Option<Vec<IndexedVerse>> {
    let words = state.words.lock().unwrap();
    let verses = state.verses.lock().unwrap();

    // Limpiar toda la frase manteniendo los espacios
    let clean_string: String = clean_phrase(&search);
    let split_string: Vec<&str> = clean_string.split_whitespace().collect(); // O usar split(" ")
    

    println!("{:?}", split_string);

    if split_string.is_empty() {
        return None;
    }

    // Encontrar IDs que contienen todas las palabras
    let first_word = split_string[0];
    let mut result_ids: Vec<usize> = match words.get(first_word) {
        Some(ids) => ids.clone(),
        None => return None,  // Si la primera palabra no existe
    };
    
    for word in &split_string[1..] {
        if let Some(verse_ids) = words.get(*word) {
            result_ids.retain(|id| verse_ids.contains(id));
            if result_ids.is_empty() {
                return None;
            }
        } else {
            return None;
        }
    }

    result_ids.sort();
    result_ids.dedup();

    println!("{:?}", result_ids);


    let mut result_texts: Vec<IndexedVerse> = vec![];

    for verse_index in result_ids {
        if let Some(ver) = verses.get(&verse_index) {
            result_texts.push(ver.clone());
        }
    }

    if result_texts.is_empty() {
        None
    } else {
        Some(result_texts)
    }
}

fn clean_phrase(phrase: &str) -> String {
    phrase
        .split_whitespace()  // Separar por espacios
        .map(|word| get_clean_word(word))  // Limpiar cada palabra
        .collect::<Vec<String>>()
        .join(" ")  // Unir con espacios
}

// Tu estructura IndexedBible debe inicializarse correctamente en el estado de Tauri
#[derive(Debug, Serialize, Deserialize)]
pub struct SerialisableIndexedBible {
    pub verses: HashMap<usize, IndexedVerse>,
    pub words: HashMap<String, Vec<usize>>,
}

pub struct IndexedBible {
    pub verses: Mutex<HashMap<usize, IndexedVerse>>,
    pub words: Mutex<HashMap<String, Vec<usize>>>,
}

impl Default for IndexedBible {
    fn default() -> Self {
        Self {
            verses: Mutex::new(HashMap::new()),
            words: Mutex::new(HashMap::new()),
        }
    }
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
pub struct IndexedVerse {
    pub book_number: u32,
    pub chapter_number: u32,
    pub verse_number: u32,
    pub verse_string: String,
}