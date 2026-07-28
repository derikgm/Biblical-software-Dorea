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
  open_search_result = signal<boolean> (false);
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

  const result: IndexedVerse[] = await invoke("search_in_bible", {search});
  const words_in_search = search.split(" ");

  this.string_to_search.set(words_in_search);
  this.verses_searched.set(result);

  this.open_search_result.set(true);

  }

  async get_bible(){
    const bible: Bible = await invoke("get_all_bible", {});
    this.bible.set(bible);
  }
}
