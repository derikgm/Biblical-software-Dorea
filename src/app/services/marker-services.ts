import { inject, Injectable, signal } from '@angular/core';
import { Mark } from '../interfaces/bible-interface';
import { invoke } from '@tauri-apps/api/core';
import { BibleServices } from './bible-services';
import { Note } from '../interfaces/tree-folder-interfaces';

@Injectable({
  providedIn: 'root',
})
export class MarkerServices {
  marks: Map<number, Mark[]> = new Map();
  bible_services = inject(BibleServices);

  current_mark_selected = signal<Mark | null>(null);

  async init() {
    const bible = this.bible_services.bible()?.abbreviation;
    if (bible == '' || !bible) return;

    await invoke('get_marks', { bible })
      .then((v) => {
        const marks = v as unknown as Mark[];
        this.marks = new Map();

        marks.forEach((m) => {
          const existing = this.marks.get(m.book);

          if (existing) existing.push(m);
          else this.marks.set(m.book, [m]);
        });
      })
      .catch((e) => {
        console.error(e);
      });
  }

  async save_mark(
    style: number,
    start_verse: number,
    end_verse: number,
    start: number,
    end: number,
  ) {
    const mark: Mark = {
      style,
      start,
      end,
      book: (this.bible_services.current_book()?.nr ?? 1) - 1,
      chapter: this.bible_services.current_chapter() - 1,
      start_verse,
      end_verse,
    };

    const mark_key = this.marks.get(mark.book);

    if (
      mark_key?.some(
        (m) =>
          m.style === mark.style &&
          m.book === mark.book &&
          m.chapter === mark.chapter &&
          m.start === mark.start &&
          m.end === mark.end &&
          m.start_verse === mark.start_verse &&
          m.end_verse === mark.end_verse,
      )
    )
      return;

    invoke('save_mark', { mark, bible: this.bible_services.bible()?.abbreviation })
      .then(() => {
        const existing = this.marks.get(mark.book);

        if (existing) existing.push(mark);
        else this.marks.set(mark.book, [mark]);
      })
      .catch((e) => {
        console.error(e);
      });
  }

  set_current_mark(book: number, index: number) {
    const mark = this.marks.get(book)?.at(index);
    if (mark) this.current_mark_selected.set(mark);
  }

  async save_linked_mark(note: Note) {
    invoke('save_linked_mark', { note }).catch((e) => {
      console.error('Error: ', e);
    });
  }
}
