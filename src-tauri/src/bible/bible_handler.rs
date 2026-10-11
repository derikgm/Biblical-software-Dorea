use serde::{Deserialize, Serialize};
use serde_json::json;
use std::collections::{HashMap, HashSet};
use std::fs::{self};
use std::path::Path;
use std::sync::Mutex;

use crate::bible::marker_handler::Mark;
use crate::helpers::directory_handler::get_bible_path;
use crate::helpers::directory_handler::get_settings_path;
use crate::notes::notes_handler::Note;

#[tauri::command]
pub fn get_all_bible(bible: String, state: tauri::State<IndexedBible>) -> Result<Bible, String> {
    let bible_str = fs::read_to_string(format!("{}/{}.json", get_bible_path(), bible))
        .map_err(|e| format!("Error al leer la biblia: {e}"))?;

    let bible: Bible =
        serde_json::from_str(&bible_str).map_err(|e| format!("Error de parseo de datos: {e}"))?;

    // Indexar la biblia (esto carga o crea el índice)
    index_the_bible(&bible, &state)?;

    Ok(bible)
}

fn index_the_bible(bible: &Bible, state: &tauri::State<IndexedBible>) -> Result<(), String> {
    let path = format!("{}/indexed/{}.json", get_bible_path(), bible.abbreviation);

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
        }

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
                    list_verses.insert(
                        cont,
                        IndexedVerse {
                            book_number: b.nr,
                            chapter_number: v.chapter,
                            verse_number: v.verse,
                            verse_string: v.name.clone(),
                        },
                    );

                    // Indexar cada palabra
                    v.text.split_whitespace().for_each(|word| {
                        let clean_word = get_clean_word(word);

                        if !clean_word.is_empty() {
                            words_indexed.entry(clean_word).or_default().push(cont);
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
            fs::create_dir_all(parent).map_err(|e| format!("Error creando directorio: {e}"))?;
        }

        fs::write(&path, indexed_bible_json)
            .map_err(|e| format!("Error guardando la biblia indexada: {e}"))?;
    }

    Ok(())
}

fn get_clean_word(word: &str) -> String {
    word.to_lowercase()
        .chars()
        .filter(|c| c.is_alphabetic())
        .map(|c| match c {
            'á' => 'a',
            'é' => 'e',
            'í' => 'i',
            'ó' => 'o',
            'ú' | 'ü' => 'u',
            _ => c,
        })
        .collect::<String>()
}

#[tauri::command]
pub fn search_in_bible(
    search: String,
    state: tauri::State<IndexedBible>,
) -> Option<Vec<IndexedVerse>> {
    let words = state.words.lock().unwrap();
    let verses = state.verses.lock().unwrap();

    // Limpiar toda la frase manteniendo los espacios
    let clean_string: String = clean_phrase(&search);
    let split_string: Vec<&str> = clean_string.split_whitespace().collect();

    if split_string.is_empty() {
        return None;
    }

    // Encontrar IDs que contienen todas las palabras
    let first_word = split_string[0];
    let mut result_ids: Vec<usize> = match words.get(first_word) {
        Some(ids) => ids.clone(),
        None => return None, // Si la primera palabra no existe
    };

    for word in &split_string[1..] {
        match words.get(*word) {
            Some(verse_ids) => {
                let verse_ids: HashSet<usize> = verse_ids.iter().copied().collect();
                result_ids.retain(|id| verse_ids.contains(id));
                if result_ids.is_empty() {
                    return None;
                }
            }
            None => return None,
        }
    }

    result_ids.sort();
    result_ids.dedup();

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
        .split_whitespace() // Separar por espacios
        .map(get_clean_word) // Limpiar cada palabra
        .collect::<Vec<String>>()
        .join(" ") // Unir con espacios
}

#[tauri::command]
pub fn get_local_bibles() -> Result<Vec<String>, String> {
    let mut local_biblies: Vec<String> = Vec::new();

    let biblies_dir_content = fs::read_dir(get_bible_path())
        .map_err(|e| format!("Error obteniendo las biblias locales: {e}"))?;

    for file in biblies_dir_content {
        let file = file
            .map_err(|e| format!("Error de acceso a archivo: {e}"))?
            .path();

        if file.is_file() {
            if let Some(file_name) = file.file_prefix() {
                if let Some(extension) = file.extension() {
                    if extension == "json" {
                        local_biblies.push(file_name.to_str().unwrap().to_string());
                    }
                }
            }
        }
    }

    Ok(local_biblies)
}

#[tauri::command]
pub fn save_available_list_of_bibles(bibles: Vec<ShortBible>) -> Result<(), String> {
    let available_bibles =
        serde_json::to_string(&bibles).map_err(|e| format!("Error de conversion de JSON: {e}"))?;

    fs::write(
        format!("{}/available_bibles.json", get_settings_path()),
        available_bibles,
    )
    .map_err(|e| format!("Error guardando informacion: {e}"))?;

    Ok(())
}

#[tauri::command]
pub fn get_available_list_of_bibles() -> Result<Vec<ShortBible>, String> {
    let available_bibles_string =
        fs::read_to_string(format!("{}/available_bibles.json", get_settings_path()))
            .map_err(|e| format!("Error guardando informacion: {e}"))?;

    let available_bibles: Vec<ShortBible> = serde_json::from_str(&available_bibles_string)
        .map_err(|e| format!("Error de conversion de JSON: {e}"))?;

    Ok(available_bibles)
}

#[tauri::command]
pub fn save_bible(bible: Bible) -> Result<(), String> {
    let bible_string =
        serde_json::to_string(&bible).map_err(|e| format!("Error de parseo json: {e}"))?;

    fs::write(
        format!("{}/{}.json", get_bible_path(), bible.abbreviation),
        bible_string,
    )
    .map_err(|e| format!("Error de escritura: {e}"))?;

    Ok(())
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShortBible {
    abbreviation: String,
    translation: String,
    url: String,
    lang: String,
    language: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SerialisableIndexedBible {
    pub verses: HashMap<usize, IndexedVerse>,
    pub words: HashMap<String, Vec<usize>>,
}

pub struct IndexedBible {
    pub verses: Mutex<HashMap<usize, IndexedVerse>>,
    pub words: Mutex<HashMap<String, Vec<usize>>>,
    pub marks: Mutex<Vec<Mark>>,
    pub notes: Mutex<HashMap<String, Note>>,
}

impl Default for IndexedBible {
    fn default() -> Self {
        Self {
            verses: Mutex::new(HashMap::new()),
            words: Mutex::new(HashMap::new()),
            marks: Mutex::new(Vec::new()),
            notes: Mutex::new(HashMap::new()),
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

#[cfg(test)]
mod tests {
    use super::{clean_phrase, get_clean_word};

    #[test]
    fn limpia_palabras_con_acentos_y_signos() {
        assert_eq!(get_clean_word("Ríos"), "rios");
        assert_eq!(get_clean_word("Jesús"), "jesus");
        assert_eq!(get_clean_word("¡Hola, mundo!"), "holamundo");
        assert_eq!(get_clean_word("Über"), "uber");
        assert_eq!(get_clean_word("ÁÉÍÓÚ"), "aeiou");
    }

    #[test]
    fn limpia_frases_preservando_espacios_entre_palabras() {
        assert_eq!(clean_phrase("  El   Río  "), "el rio");
        assert_eq!(clean_phrase("Dios es amor"), "dios es amor");
        assert_eq!(clean_phrase("   "), "");
    }
}
