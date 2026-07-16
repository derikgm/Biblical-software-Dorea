import { Component, inject, signal } from '@angular/core';
import { FolderServices } from '../../services/folder-services';
import { LanguageServices } from '../../services/language-services';
import { invoke } from '@tauri-apps/api/core';
import { Note } from '../../interfaces/tree_folder-interfaces';
import { NotesServices } from '../../services/notes-services';

@Component({
  selector: 'folder-options-component',
  imports: [],
  templateUrl: './folder_options-component.html',
  styleUrl: './folder_options-component.css',
})
export class FolderOptionsComponent {
  folder_services = inject(FolderServices);
  folder_lang = inject(LanguageServices).data()?.folder;
  note_services = inject(NotesServices);

  create_note(){
    const dir = this.folder_services.folder_selected()?.dir;

    invoke("create_new_note", {dir})
    .then((res)=>{
      const new_note: Note = res as unknown as Note;

      this.folder_services.folder_selected.update((folder_selected) => {
        folder_selected?.files.push(new_note);
        return folder_selected;
      })
      
      this.note_services.current_content.set("");
      this.note_services.current_header.set(new_note.title)
      this.folder_services.close_folder_option();
    });
  }

}
