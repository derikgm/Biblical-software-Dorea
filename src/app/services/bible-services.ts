import { computed, Injectable, signal } from '@angular/core';
import { Bible, Book, Chapter, IndexedVerse } from '../interfaces/bible-interface';
import { invoke } from '@tauri-apps/api/core';

@Injectable({
  providedIn: 'root',
})
export class BibleServices {
  bible = signal<Bible | undefined> (undefined);
  current_chapter = signal<number>(1);
  current_book = signal<Book | undefined> (undefined);
  open_search_result = signal<boolean> (true);
  string_to_search = signal<string []> ([]);
  verses_searched = signal<IndexedVerse []> ([]);

  async init() {
    await this.get_bible();
    this.current_book.set(this.bible()?.books[42]);
    this.current_chapter.set(3);
  }

  move_to_chapter(book_number: number, verse_number: number){
    this.current_book.set(this.bible()?.books[book_number - 1]);
    this.current_chapter.set(verse_number);
  }

  async search_in_bible(search: string){
  const start = new Date(); // 👈 Marca el inicio

  const result: IndexedVerse[] = await invoke("search_in_bible", {search});
  const words_in_search = search.split(" ");

  this.string_to_search.set(words_in_search);
  this.verses_searched.set(result);

  const end = new Date(); // 👈 Marca el final

  // ✅ FORMA CORRECTA de calcular la diferencia
  const elapsedMs = end.getTime() - start.getTime(); // Milisegundos
  const elapsedSeconds = elapsedMs / 1000; // Segundos

  console.log(`⏱️ Búsqueda completada en: ${elapsedMs}ms (${elapsedSeconds.toFixed(3)}s)`);
    
  }

  async get_bible(){
    const bible: Bible = await invoke("get_all_bible", {});
    this.bible.set(bible);
  }
}
