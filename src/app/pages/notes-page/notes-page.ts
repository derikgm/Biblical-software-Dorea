import { Component, computed, ElementRef, HostListener, inject, signal, ViewChild } from '@angular/core';
import { NotesServices, } from '../../services/notes-services';
import { LanguageServices } from '../../services/language-services';
import { invoke } from '@tauri-apps/api/core';

@Component({
  selector: 'notes-page',
  templateUrl: './notes-page.html',
  styleUrl: './notes-page.css',

})
export class NotesPage {
  @ViewChild("text_area") text_area!: ElementRef<HTMLTextAreaElement>

  notes_services = inject(NotesServices);
  lang = inject(LanguageServices);

  jump_to_textarea(event: KeyboardEvent){
    if(event.key == 'Enter') {
      event.preventDefault();
      this.text_area.nativeElement.focus()
    }
  }

  text_area_handler() {
    this.notes_services.current_content.set(this.text_area.nativeElement.value);
  }

  show_ready_to_save(){
    return this.notes_services.current_content() != this.notes_services.old_content()
  }

  @HostListener('keydown', ['$event'])
  save_note(event: KeyboardEvent){
    if(event.ctrlKey && event.key === "s"){
      event.preventDefault()

      invoke("save_note", {dir: this.notes_services.current_dir(), content: this.text_area.nativeElement.value})
      .then((v)=>{
        console.log(v);
        this.notes_services.old_content.set(this.text_area.nativeElement.value);        
      })

    }

  }

}
