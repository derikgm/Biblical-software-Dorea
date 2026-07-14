import { Component, inject, signal } from '@angular/core';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { heroPlus, heroTrash } from '@ng-icons/heroicons/outline';
import { NoteComponent } from "../../components/note-component/note-component";
import { NotesServices, } from '../../services/notes-services';

@Component({
  selector: 'notes-page',
  imports: [NgIcon, NoteComponent],
  templateUrl: './notes-page.html',
  styleUrl: './notes-page.css',
  providers:[
    provideIcons({
      plus: heroPlus,
      delete: heroTrash
    })
  ]
})
export class NotesPage {
  open_dialog = signal<boolean>(false);
  note_selected = signal<number>(-1);

  notes_services = inject(NotesServices);

  openDialog(index: number){
    if(index == -1){
      this.open_dialog.set(false);
      return;
    }
    
    this.note_selected.set(index);
    this.open_dialog.set(true);
  }

}
