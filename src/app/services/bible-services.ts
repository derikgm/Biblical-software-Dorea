import { computed, Injectable, signal } from '@angular/core';
import { Bible, Book, Chapter } from '../interfaces/bible-interface';
import { invoke } from '@tauri-apps/api/core';

@Injectable({
  providedIn: 'root',
})
export class BibleServices {
  bible = signal<Bible | undefined> (undefined);
  current_chapter = signal<number>(1);
  current_book = signal<Book | undefined> (undefined);
  // chapters_showed = signal<(Chapter | undefined)[]>([undefined]);

  async init() {
    await this.get_bible();
    this.current_book.set(this.bible()?.books[42]);
    this.current_chapter.set(3);

    // this.chapters_showed.update(() => this.get_chapters_to_show());
  }

  move_to_chapter(book_number: number, verse_number: number){
    this.current_book.set(this.bible()?.books[book_number - 1]);
    this.current_chapter.set(verse_number);
  }

  // get_chapters_to_show(){
  //   return [
  //     this.current_book()?.chapters[this.current_chapter() - 2],
  //     this.current_book()?.chapters[this.current_chapter() - 1],
  //     this.current_book()?.chapters[this.current_chapter()],
  //     this.current_book()?.chapters[this.current_chapter() + 1],
  //     this.current_book()?.chapters[this.current_chapter() + 2]
  //   ]
  // }

  async get_bible(){
    const bible: Bible = await invoke("get_all_bible", {});
    this.bible.set(bible);
  }
}
