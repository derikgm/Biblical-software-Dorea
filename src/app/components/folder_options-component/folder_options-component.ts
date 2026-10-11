import { AfterViewInit, Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FolderServices } from '../../services/folder-services';
import { LanguageServices } from '../../services/language-services';

@Component({
  selector: 'folder-options-component',
  imports: [],
  templateUrl: './folder_options-component.html',
  styleUrl: './folder_options-component.css',
})
export class FolderOptionsComponent implements AfterViewInit {
  @ViewChild('menu_container') menu_container!: ElementRef<HTMLDivElement>;

  folder_services = inject(FolderServices);
  folder_lang = inject(LanguageServices).data()?.folder;

  is_from_extended_sidebar = this.folder_services.is_from_extended_sidebar;

  x_position = signal<number>(0);
  y_position = signal<number>(0);

  ngAfterViewInit(): void {
    let pos_y = this.folder_services.y_position();
    const height = this.menu_container.nativeElement.getBoundingClientRect().height;

    pos_y = pos_y + height > window.innerHeight ? pos_y - height : pos_y;

    this.y_position.set(pos_y);
    this.x_position.set(this.folder_services.x_position());
  }

  create_new_note() {
    this.folder_services.enable_create_note();
  }

  create_new_folder() {
    this.folder_services.enable_create_folder();
  }

  rename_file_or_folder() {
    this.folder_services.enabled_rename_file_or_folder();
  }

  delete_file_or_folder() {
    this.folder_services.delete_folder_or_file();
  }
}
