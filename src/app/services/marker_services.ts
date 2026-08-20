import { inject, Injectable, signal } from '@angular/core';
import { Mark } from '../interfaces/bible-interface';
import { invoke } from '@tauri-apps/api/core';
import { GlobalSettingsServices } from './global_settings-services';
import { BibleServices } from './bible-services';
import { Note } from '../interfaces/tree_folder-interfaces';

@Injectable({
  providedIn: 'root',
})
export class MarkerServices {
  marks: Map<number, Mark[]> = new Map();
  bible_services = inject(BibleServices)
  
  current_mark_selected = signal<Mark | null>(null);

  async init(){
    const bible = this.bible_services.bible()?.abbreviation;
    if(bible == "" || !bible) return;

    await invoke("get_marks", {bible})
    .then((v) => {
      
      const marks = v as unknown as Mark[];
      this.marks = new Map();

      marks.forEach((m) => {
        this.marks.has(m.book)
        ? this.marks.get(m.book)?.push(m)
        : this.marks.set(m.book, [m]);
      })
    })
  } 

  async save_mark (style: number, start_verse: number, end_verse: number, start: number, end: number){
    const {} = this.bible_services.current_book()!;
    const mark: Mark = {
      style,
      start,
      end,
      book: (this.bible_services.current_book()?.nr ?? 1) - 1,
      chapter: this.bible_services.current_chapter() - 1,
      start_verse,
      end_verse,
    }

    const mark_key = this.marks.get(mark.book);

    if(mark_key)
      if(mark_key.includes(mark)) return

    invoke("save_mark", {mark, bible: this.bible_services.bible()?.abbreviation})
    .then(() => {
      this.marks.has(mark.book)
        ? this.marks.get(mark.book)?.push(mark)
        : this.marks.set(mark.book, [mark]);

      console.log(this.marks);
    })
    .catch((e) => {
      console.log(e);
    })
  }

  set_current_mark(book: number, index: number){
    const mark = this.marks.get(book)?.at(index);
    if(mark) this.current_mark_selected.set(mark)
  }

  async save_linked_mark (note: Note) {
    invoke("save_link_mark", {note})
    .then((v) => {
      console.log("Guardado correctamente");
    })
    .catch((e) => {
      console.log("Error: ", e);
    })
  }
}
