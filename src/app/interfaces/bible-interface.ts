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
  nr: number;           // número del libro
  name: string;
  chapters: Chapter[];
}

export interface Chapter {
  chapter: number;      // número de capítulo
  name: string;         // ej. "Génesis 1"
  verses: Verse[];
}

export interface Verse {
  chapter: number;      // número de capítulo (redundante pero está en el JSON)
  verse: number;        // número de versículo
  name: string;         // ej. "Génesis 1:1"
  text: string;
}