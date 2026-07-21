import { Component, inject, signal } from '@angular/core';
import { FolderServices } from '../../services/folder-services';
import { LanguageServices } from '../../services/language-services';

@Component({
  selector: 'folder-options-component',
  imports: [],
  templateUrl: './folder_options-component.html',
  styleUrl: './folder_options-component.css',
})
export class FolderOptionsComponent {
  folder_services = inject(FolderServices);
  folder_lang = inject(LanguageServices).data()?.folder;

  create_new_note(){
    this.folder_services.create_new_note()
  }

  create_new_folder(){
    this.folder_services.create_new_folder()
  }

  rename_file_or_folder(){
    this.folder_services.enabled_rename_file_or_folder()
  }
  
  delete_file_or_folder(){
    this.folder_services.delete_folder_or_file()
  }
}
