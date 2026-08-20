import { Component, inject } from '@angular/core';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { matAddLinkOutline, matDeleteForeverOutline, matDeleteOutline } from '@ng-icons/material-icons/outline';
import { GlobalSettingsServices } from '../../services/global_settings-services';
import { FolderServices } from '../../services/folder-services';

@Component({
  selector: 'mark-options-component',
  imports: [NgIcon],
  providers:[
    provideIcons({
      link: matAddLinkOutline,
      delete: matDeleteOutline
    })
  ],
  template: `
  
  @for (option of options; track $index) {
    <div 
    (click)="option.function()"
    class="cursor-pointer w-8 h-8 rounded-full border border-gray-500 flex items-center justify-center
    hover:bg-blue-400 hover:text-white dark:hover:bg-blue-700">
      <ng-icon [name]="option.icon" />
    </div>
  }
  `,
})
export class MarkOptionsComponent {
  folder_and_notes_services = inject(FolderServices)

  options = [
    {icon: "link", function: () => {this.link_mark()}},
    {icon: "delete", function: () => {}},
  ]

  link_mark(){
    this.folder_and_notes_services.link_note();
  }
}
