import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  QueryList,
  signal,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { FolderServices } from '../../services/folder-services';
import { Note } from '../../interfaces/tree-folder-interfaces';
import { Router } from '@angular/router';
import { SidebarSettingsServices } from '../../services/sidebar-settings-services';
import { FocusOnCreateDirective } from '../../directives/focus-on-create.directive';
import { MarkerServices } from '../../services/marker-services';

@Component({
  selector: 'app-search-note',
  imports: [FocusOnCreateDirective],
  templateUrl: 'search-note-component.html',
})
export class SearchNoteComponent implements AfterViewInit {
  @ViewChild('filter_input') filter_input!: ElementRef<HTMLInputElement>;
  @ViewChild('scroll_bar') scroll_bar!: ElementRef<HTMLDivElement>;
  @ViewChild('container') container!: ElementRef<HTMLDivElement>;
  @ViewChildren('note') html_notes!: QueryList<ElementRef<HTMLInputElement>>;

  folder_and_notes_services = inject(FolderServices);
  sidebar_settings_services = inject(SidebarSettingsServices);
  marker_services = inject(MarkerServices);
  router = inject(Router);
  notes_array = this.folder_and_notes_services.notes_array;

  notes = signal<Note[]>([]);

  selected_item = signal<number>(-1);
  container_size = 0;
  scroll_bar_size_porcent = 0;
  note_size = 0;
  notes_length = 0;

  ngAfterViewInit(): void {
    this.notes.set(this.folder_and_notes_services.notes_array());

    window.addEventListener('resize', () => {
      this.container_size = this.container.nativeElement.getBoundingClientRect().height;
      this.scroll_bar_size_porcent = this.container_size / (this.note_size * this.notes_length);

      this.handler_scroll_bar_visibility();
    });

    requestAnimationFrame(() => {
      setTimeout(() => {
        this.container_size = this.container.nativeElement.getBoundingClientRect().height;

        const aux_html_note = this.html_notes.get(0)?.nativeElement;

        if (!aux_html_note) return;

        this.note_size = aux_html_note.scrollHeight;
        this.notes_length = this.html_notes.length;
        this.scroll_bar_size_porcent = this.container_size / (this.note_size * this.notes_length);

        this.scroll_bar.nativeElement.style.height = `${this.scroll_bar_size_porcent * 100}%`;

        this.handler_scroll_bar_visibility();
      }, 0);
    });

    this.container.nativeElement.addEventListener('scroll', () => {
      const scroll = this.container.nativeElement.scrollTop;
      const top = `${scroll + scroll * this.scroll_bar_size_porcent - this.scroll_bar_size_porcent * 10}px`;
      this.scroll_bar.nativeElement.style.top = top;
    });
  }

  handler_scroll_bar_visibility() {
    if (this.scroll_bar_size_porcent * 100 >= 100)
      this.scroll_bar.nativeElement.classList.add('hidden');
    else {
      this.scroll_bar.nativeElement.classList.remove('hidden');
      this.scroll_bar.nativeElement.style.height = `${this.scroll_bar_size_porcent * 100}%`;
    }
  }

  handler_filter(event: KeyboardEvent) {
    const notes_showed_lenght = this.notes().length;
    const key = event.key;

    if (key == 'ArrowDown') {
      event.preventDefault();

      this.selected_item.update((v) =>
        v == notes_showed_lenght - 1 ? notes_showed_lenght - 1 : ++v,
      );
      this.apply_selector(this.selected_item(), true);
    } else if (key == 'ArrowUp') {
      event.preventDefault();

      this.selected_item.update((v) => (v <= 0 ? 0 : --v));
      this.apply_selector(this.selected_item(), false);
    } else if (key == 'Enter') {
      this.jump_to_note_page(this.selected_item());
    } else {
      const filter_notes: Note[] = [];

      let word = this.filter_input.nativeElement.value;

      if (key.length == 1) word += key;
      else if (key == 'Backspace') word = word.slice(0, -1);

      this.notes_array().forEach((n) => {
        if (n.title.includes(word)) filter_notes.push(n);
      });

      this.notes.set(filter_notes);
      const scroll_bar_size = (this.container_size / (this.note_size * this.notes().length)) * 100;

      if (scroll_bar_size >= 100) this.scroll_bar.nativeElement.classList.add('hidden');
      else {
        this.scroll_bar.nativeElement.classList.remove('hidden');
        const scroll_bar_size_string = `${scroll_bar_size}%`;
        this.scroll_bar.nativeElement.style.height = scroll_bar_size_string;
      }

      this.selected_item.update(() => 0);
      this.apply_selector(0, true);
    }
  }

  jump_to_note_page(note_index: number, event: Event | null = null) {
    if (event) event.stopPropagation();

    if (note_index == -1 || note_index > this.notes().length) return;
    const note = this.notes()[note_index];

    if (this.folder_and_notes_services.is_from_link_note) {
      const mark = this.marker_services.current_mark_selected();

      if (mark != null) note.linked_marks.push(mark);

      this.marker_services.save_linked_mark(note);
      this.folder_and_notes_services.is_from_link_note = false;
    } else {
      this.folder_and_notes_services.open_file(note, undefined);
      this.sidebar_settings_services.anchor_handler(1);
      this.router.navigate(['/notes']);
    }

    this.close();
  }

  @HostListener('document:keydown.escape')
  close() {
    this.folder_and_notes_services.show_notes_searcher.set(false);
  }

  apply_selector(current_index: number, is_up: boolean) {
    const html_note = this.html_notes.get(current_index)!.nativeElement;
    const previus_html_note = this.html_notes.get(current_index + (is_up ? -1 : 1))?.nativeElement;

    html_note.classList.add('bg-note');

    if (previus_html_note) previus_html_note.classList.remove('bg-note');

    const long = html_note.scrollHeight * (current_index + 1);

    if (!is_up) {
      const scroll_top_element = this.container.nativeElement.scrollTop;
      const round = Math.round((scroll_top_element - long) / this.note_size) + 1;

      if (round >= 0) {
        const scroll_top = scroll_top_element - (this.note_size - (long - scroll_top_element));
        this.container.nativeElement.scrollTop = scroll_top;
      }
    } else {
      if (this.container_size <= long) {
        const scroll_top = long - this.container_size;
        this.container.nativeElement.scrollTop = scroll_top;
      }
    }
  }
}
