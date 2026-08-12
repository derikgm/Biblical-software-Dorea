import { Component } from '@angular/core';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { matAddLinkOutline, matDeleteForeverOutline, matDeleteOutline } from '@ng-icons/material-icons/outline';

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
    class="cursor-pointer w-8 h-8 rounded-full border border-gray-500 flex items-center justify-center
    hover:bg-blue-400 hover:text-white dark:hover:bg-blue-700">
      <ng-icon [name]="option.icon" />
    </div>
  }

  <!-- <div 
  class="cursor-pointer w-8 h-8 rounded-full border border-gray-500 flex items-center justify-center
  hover:bg-blue-300">
    <ng-icon name="delete" />
  </div> -->
  `,
})
export class MarkOptionsComponent {
  options = [
    {icon: "link"},
    {icon: "delete"},
  ]
}
