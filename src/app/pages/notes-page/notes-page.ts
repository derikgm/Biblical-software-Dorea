import { Component, computed, ElementRef, HostListener, inject, signal, ViewChild } from '@angular/core';
import { LanguageServices } from '../../services/language-services';
import { invoke } from '@tauri-apps/api/core';
import { FolderServices } from '../../services/folder-services';

@Component({
  selector: 'notes-page',
  templateUrl: './notes-page.html',
  styleUrl: './notes-page.css',

})
export class NotesPage {
  @ViewChild("text_area") text_area!: ElementRef<HTMLTextAreaElement>

  folder_services = inject(FolderServices);
  lang = inject(LanguageServices);

  jump_to_textarea(event: KeyboardEvent){
    if(event.key == 'Enter') {
      event.preventDefault();
      this.text_area.nativeElement.focus()
    }
  }

  update_title(event: Event){
    
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

  show_ready_to_save(){
    return this.folder_services.current_content() != this.folder_services.old_content()
  }

  @HostListener('keydown', ['$event'])
  save_note(event: KeyboardEvent){
    if(event.ctrlKey && event.key === "s"){
      event.preventDefault()

      invoke("save_note", {dir: this.folder_services.current_dir(), content: this.text_area.nativeElement.value})
      .then((v)=>{
        console.log(v);
        this.folder_services.old_content.set(this.text_area.nativeElement.value);        
      })
      .catch(e => console.log(e))
    }

  }

}
