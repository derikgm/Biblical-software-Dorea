import { Component, inject, signal } from '@angular/core';
import { FolderServices } from '../../services/folder-services';
import { LanguageServices } from '../../services/language-services.ts';

@Component({
  selector: 'folder-options-component',
  imports: [],
  templateUrl: './folder_options-component.html',
  styleUrl: './folder_options-component.css',
})
export class FolderOptionsComponent {
  folder_services = inject(FolderServices);
  folder_lang = inject(LanguageServices).data()?.folder;
}
