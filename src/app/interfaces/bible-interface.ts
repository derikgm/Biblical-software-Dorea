export interface Bible {
  translation: string;
  abbreviation: string;
  description: string;
  lang: string;
  language: string;
  direction: 'LTR' | 'RTL';
  encoding: string;
  books: Book[];

  // Distribución (opcional)
  distribution_lcsh?: string;
  distribution_version?: string;
  distribution_version_date?: string;
  distribution_abbreviation?: string;
  distribution_about?: string;
  distribution_license?: string;
  distribution_sourcetype?: string;
  distribution_source?: string;
  distribution_versification?: string;
  distribution_history?: Record<string, string>;
}

export interface Book {
  nr: number;
  name: string;
  chapters: Chapter[];
}

export interface Chapter {
  chapter: number;      
  name: string;         
  verses: Verse[];
}

export interface Verse {
  chapter: number;     
  verse: number;       
  name: string;        
  text: string;
}

export interface IndexedVerse {
    book_number: number,
    chapter_number: number,
    verse_number: number,
    verse_string: string,
}