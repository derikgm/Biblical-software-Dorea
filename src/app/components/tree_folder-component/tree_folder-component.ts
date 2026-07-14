import { Component, inject, input, output, signal } from '@angular/core';
import { Folder } from '../../interfaces/tree_folder-interfaces';
import { FolderServices } from '../../services/folder-services';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { heroChevronRight, heroChevronDown } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'tree-folder-component',
  imports: [NgIcon],
  templateUrl: './tree_folder-component.html',
  styleUrl: './tree_folder-component.css',
  providers: [
    provideIcons({
      close: heroChevronRight,
      open: heroChevronDown
    })
  ]
})
export class TreeFolderComponent {
  folders = input<Folder>();
  floor = input.required<number>();

  is_open = signal<boolean>(this.folders()?.open ?? true);

  folder_services = inject(FolderServices);

  open_folder(){
    this.is_open.set(!this.is_open());
  }

  add_new_file(){
    this.folders()?.files?.push("file01");
    this.folders()?.files?.sort();
  }

  add_new_folder(){
    this.folders()?.folders?.push({
      folder_name: "example",
      open: true,
    });
    this.folders()?.folders?.sort();
  }

  show_options(event: MouseEvent, index: number = -1){
    event.preventDefault();

    console.log(index);
    
    this.folder_services.show_folder_option(event.x, event.y, this.folders(), index);
  }
}

