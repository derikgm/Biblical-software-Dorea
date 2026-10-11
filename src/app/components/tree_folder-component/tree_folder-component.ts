import { Component, ElementRef, inject, input, signal, ViewChild } from '@angular/core';
import { Folder, Note } from '../../interfaces/tree_folder-interfaces';
import { FolderServices } from '../../services/folder-services';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { heroChevronRight, heroChevronDown, heroDocumentText } from '@ng-icons/heroicons/outline';
import { FocusOnCreateDirective } from '../../directives/focus-on-create.directive';

@Component({
  selector: 'tree-folder-component',
  imports: [NgIcon, FocusOnCreateDirective],
  templateUrl: './tree_folder-component.html',
  providers: [
    provideIcons({
      close: heroChevronRight,
      open: heroChevronDown,
      txt: heroDocumentText,
    }),
  ],
})
export class TreeFolderComponent {
  folders = input<Folder>();
  floor = input.required<number>();

  enabled_create_input = true;

  @ViewChild('rename_input') rename_input!: ElementRef<HTMLInputElement>;
  @ViewChild('create_input') create_input!: ElementRef<HTMLInputElement>;

  is_open = signal<boolean>(this.folders()?.open ?? true);

  folder_services = inject(FolderServices);

  open_file(note: Note) {
    this.folder_services.open_file(note, this.folders());
  }

  open_folder() {
    this.is_open.set(!this.is_open());
  }

  show_options(event: MouseEvent, index: number = -1) {
    event.preventDefault();
    this.folder_services.show_folder_option(event.x, event.y, this.folders(), index);
  }

  show_options_from_extended_sidebar(event: MouseEvent) {
    event.preventDefault();
    this.folder_services.show_folder_option_from_extended_sidebar(event.x, event.y);
  }

  finish_to_rename() {
    this.folder_services.finish_to_rename();
  }

  handler_rename_input(event: KeyboardEvent, is_dir = false) {
    const el = event.target as HTMLInputElement;

    if (FORBIDDEN_CHARACTERS.has(event.key)) {
      setTimeout(() => {
        el.value = el.value.slice(0, -1);
      }, 0);
    }

    if (event.key == 'Enter') {
      this.folder_services.update_name_from_sidebar(el.value, is_dir);
    }
  }

  finish_to_create() {
    this.folder_services.finish_to_create();
  }

  handler_create_input(event: KeyboardEvent, is_dir: boolean = false) {
    const el = event.target as HTMLInputElement;

    if (FORBIDDEN_CHARACTERS.has(event.key)) {
      setTimeout(() => {
        el.value = el.value.slice(0, -1);
      }, 0);
    }

    const files = this.folders()?.files;

    if (files)
      for (const file of files)
        if (`${file.title}.${file.extension}` == el.value) {
          this.enabled_create_input = false;
          el.classList.add('bg-red-400', 'dark:bg-red-600');
          setTimeout(() => {
            el.classList.remove('bg-red-400', 'dark:bg-red-600');
          }, 1500);
          return;
        }

    if (event.key == 'Enter' && this.enabled_create_input) {
      if (el.value == '') {
        el.blur();
        return;
      }

      if (is_dir) this.folder_services.create_new_folder(el.value);
      else this.folder_services.create_new_note(el.value);
    }
  }
}

const FORBIDDEN_CHARACTERS = new Set(['<', '>', ':', '"', '/', '\\', '|', '?', '*']);
