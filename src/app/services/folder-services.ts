import { Injectable, signal } from '@angular/core';
import { Folder, Note } from '../interfaces/tree_folder-interfaces';
import { invoke } from '@tauri-apps/api/core';

@Injectable({
  providedIn: 'root',
})
export class FolderServices {
  is_show = signal<boolean>(false);
  x_position = signal<number>(0);
  y_position = signal<number>(0);
  folder_selected = signal<Folder | null>(null);
  file = signal<Note | null>(null);
  directory = signal<Folder | undefined>(undefined);

  folder_root = signal<Folder | undefined>(undefined);

  init(){
    invoke("get_notes_folders", {}).then((v) => {
      this.folder_root.set(v as unknown as Folder)
    })
  }

  show_folder_option (x: number = 0, y: number = 0, folder_selected: Folder | undefined, index: number){
    this.is_show.set(true);
    this.x_position.set(x)
    this.y_position.set(y)
    this.folder_selected.set(folder_selected ?? null);
    this.file.set( (folder_selected?.files && index != -1) ? folder_selected.files[index] : null)
  }

  close_folder_option (){
    this.is_show.set(false)
    this.folder_selected.set(null);
    this.file.set(null)
  }

}
