import { Component, ElementRef, HostListener, inject, signal, ViewChild } from '@angular/core';
import { LanguageServices } from '../../services/language-services';
import { invoke } from '@tauri-apps/api/core';
import { FolderServices } from '../../services/folder-services';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { matLinkOffOutline, matLinkOutline } from '@ng-icons/material-icons/outline';
import { BibleServices } from '../../services/bible-services';
import { Mark } from '../../interfaces/bible-interface';

@Component({
  selector: 'app-notes-page',
  templateUrl: './notes-page.html',
  providers: [
    provideIcons({
      verses: matLinkOutline,
      nonVerses: matLinkOffOutline,
    }),
  ],
  imports: [NgIcon],
})
export class NotesPage {
  @ViewChild('text_area') text_area!: ElementRef<HTMLTextAreaElement>;

  folder_services = inject(FolderServices);
  bible_services = inject(BibleServices);
  lang = inject(LanguageServices);

  is_ready_to_save = signal(false);
  show_linked_verses = signal(true);

  jump_to_textarea(event: KeyboardEvent) {
    if (event.key == 'Enter') {
      event.preventDefault();
      this.text_area.nativeElement.focus();
    }
  }

  change_linked_verses_visibility() {
    this.show_linked_verses.update((v) => !v);
  }

  create_new_note() {
    this.folder_services.create_new_note('new_note');
  }

  update_title(event: Event) {
    const el = event.target as HTMLInputElement;
    const current_dir = this.folder_services.current_dir();
    const title = this.folder_services.current_note().title;
    const extension = this.folder_services.current_note().extension;

    this.folder_services.update_file_name(
      `${current_dir}/${title}.${extension}`,
      `${current_dir}/${el.value}.${extension}`,
      el.value,
    );
  }

  text_area_handler() {
    this.folder_services.current_content.set(this.text_area.nativeElement.value);
  }

  get_quote_string(indexed_verse: Mark) {
    const books = this.bible_services.bible()?.books ?? [];
    const book = books[indexed_verse.book].name;

    let quote = `(${book} ${indexed_verse.chapter + 1}:${indexed_verse.start_verse + 1}`;

    quote +=
      indexed_verse.end_verse == indexed_verse.start_verse ? ')' : `-${indexed_verse.end_verse})`;

    return quote;
  }

  @HostListener('keydown', ['$event'])
  save_note(event: KeyboardEvent) {
    if (!this.is_ready_to_save()) this.is_ready_to_save.set(true);

    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();

      const current_dir = this.folder_services.current_dir();
      const note = this.folder_services.current_note();
      const title = note.title;
      const extension = note.extension;

      const dir = `${current_dir}/${title}.${extension}`;
      const content = this.text_area.nativeElement.value;

      invoke('save_note', { dir, content })
        .then(() => {
          this.folder_services.old_content.set(content);
          this.folder_services.current_content.set(content);
          this.is_ready_to_save.set(false);
        })
        .catch((e) => console.error('Error al guardar la nota:', e));
    }
  }
}
