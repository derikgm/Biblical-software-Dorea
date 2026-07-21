import { ChangeDetectorRef, Component, ElementRef, inject, input, output, Signal, signal, ViewChild, viewChild } from '@angular/core';
import { Folder, Note } from '../../interfaces/tree_folder-interfaces';
import { FolderServices } from '../../services/folder-services';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { heroChevronRight, heroChevronDown, heroDocumentText } from '@ng-icons/heroicons/outline';
import { matfPdfColored } from '@ng-icons/material-file-icons/colored'; //TODO: Check later
import { FocusOnCreateDirective } from '../../directives/focus-on-create.directive';

@Component({
  selector: 'tree-folder-component',
  imports: [NgIcon, FocusOnCreateDirective],
  templateUrl: './tree_folder-component.html',
  styleUrl: './tree_folder-component.css',
  providers: [
    provideIcons({
      close: heroChevronRight,
      open: heroChevronDown,
      txt: heroDocumentText,
       pdf: matfPdfColored,
    })
  ]
})
export class TreeFolderComponent {
  folders = input<Folder>();
  floor = input.required<number>();

  enabled_input = signal<boolean> (true);

  @ViewChild("rename_input") rename_input!: ElementRef<HTMLInputElement>;


  constructor(private cdr: ChangeDetectorRef){
    
  }

  is_open = signal<boolean>(this.folders()?.open ?? true);

  folder_services = inject(FolderServices);

  open_file(note: Note){
    this.folder_services.open_file(note, this.folders())
  }

  open_folder(){
    this.is_open.set(!this.is_open());
  }

  show_options(event: MouseEvent, index: number = -1){
    event.preventDefault();
    this.folder_services.show_folder_option(event.x, event.y, this.folders(), index);
  }

  finish_to_rename(){
    this.folder_services.finish_to_rename();
  }

  handler_rename_input(event: KeyboardEvent, is_dir = false){
    const el = event.target as HTMLInputElement;

    if(FORBIDDEN_CHARACTERS.has(event.key)){
      setTimeout(()=>{
        el.value = el.value.slice(0, -1);
      }, 0)
    }

    if(event.key == "Enter"){
      this.folder_services.update_name_from_sidebar(el.value, is_dir)
    } 
    
  }

}

const FORBIDDEN_CHARACTERS = new Set(['<', '>', ':', '"', '/', '\\', '|', '?', '*']);
