import { Injectable, signal } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { Note } from '../interfaces/tree_folder-interfaces';

@Injectable({
  providedIn: 'root',
})
export class NotesServices {
  current_content = signal<string>("");
  old_content = signal<string>("");
  current_header = signal<string>("");
  current_dir = signal<string>("");

  open_file(dir: string, title: string){
    invoke('get_note', {dir})
    .then((v)=> {
      this.current_content.set(v as string);
      this.old_content.set(v as string);
      this.current_dir.set(dir);
    })
    .catch(()=>{
      console.log("se rompio");
    })

    this.current_header.set(title);
  }
}


