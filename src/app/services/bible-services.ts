import { computed, inject, Injectable, signal } from '@angular/core';
import { Bible, Book, Chapter, IndexedVerse } from '../interfaces/bible-interface';
import { invoke } from '@tauri-apps/api/core';
import { GlobalSettingsServices } from './global_settings-services';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BibleServices {
  bible = signal<Bible | undefined> (undefined);
  current_chapter = signal<number>(0);
  current_book = signal<Book | undefined> (undefined);
  open_search_result = signal<boolean> (false);
  string_to_search = signal<string []> ([]);
  verses_searched = signal<IndexedVerse []> ([]);
  is_jumped_from_note_page = signal<boolean>(true);

  private verse_moved = new Subject<string>();
  select_verse_to_move$ = this.verse_moved.asObservable();

  private chapter_moved = new Subject<string>();
  select_chapter_to_move$ = this.chapter_moved.asObservable();

  gss = inject(GlobalSettingsServices);

  async init() {
    if(this.gss.settings.current_bible == "") return;

    await this.get_bible(this.gss.settings.current_bible);

    if(this.bible()){
      this.current_book.set(this.bible()?.books[this.gss.settings.current_book]);
      this.current_chapter.set(this.gss.settings.current_chapter);

      this.chapter_moved.next(`${this.gss.settings.current_book + 1}-${this.gss.settings.current_chapter}`)
    }
  }

  set_current_chapter (book_number: number, chapter_number: number){
    this.current_book.set(this.bible()?.books[book_number - 1]);
    this.current_chapter.set(chapter_number);

    this.gss.save_current_chapter(book_number - 1, chapter_number);
  }

  move_to_chapter (book_number: number, chapter_number: number){
    this.set_current_chapter(book_number, chapter_number);
    this.chapter_moved.next(`${book_number}-${chapter_number}`);
  }

  move_to_verse(book_number: number, chapter_number: number, verse_number: number){
    this.set_current_chapter(book_number, chapter_number);
    this.verse_moved.next(`${book_number}-${chapter_number}-${verse_number}`);
  }

  async search_in_bible(search: string){

  const result: IndexedVerse[] = await invoke("search_in_bible", {search});
  const words_in_search = search.split(" ");

  this.string_to_search.set(words_in_search);
  this.verses_searched.set(result);

  this.open_search_result.set(true);

  }

  async get_bible(bible_abb: string){
    await invoke("get_all_bible", {bible: bible_abb})
    .then((bible) => {
      this.bible.set(bible as unknown as Bible);
    })
    .catch((e) => {
      console.log(e);
    });
  }

  async select_bible(bible_abb: string) {
    if(bible_abb == "") return;
    if(bible_abb == this.gss.settings.current_bible) return;

    this.gss.is_loading.set(true);
    await this.get_bible(bible_abb);
    
    this.current_book.set(this.bible()?.books[0]);
    this.current_chapter.set(0);
    
    this.gss.settings.current_bible = bible_abb;
    this.gss.settings.current_book = 0;
    this.gss.settings.current_chapter = 1;
    
    this.current_book.set(this.bible()?.books[0]);
    this.current_chapter.set(1);

    this.gss.save_settings();    

    this.gss.is_loading.set(false);
  }
  
}
