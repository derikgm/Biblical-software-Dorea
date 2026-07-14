import { Injectable, signal } from '@angular/core';
import { Folder } from '../interfaces/tree_folder-interfaces';

@Injectable({
  providedIn: 'root',
})
export class FolderServices {
  is_show = signal<boolean>(false);
  x_position = signal<number>(0);
  y_position = signal<number>(0);
  folder = signal<Folder | null>(null);
  file = signal<string | null>(null);

  show_folder_option (x: number = 0, y: number = 0, folder: Folder | undefined, index: number){
    this.is_show.set(true);
    this.x_position.set(x)
    this.y_position.set(y)
    this.folder.set(folder ?? null);
    this.file.set( (folder?.files && index != -1) ? folder.files[index] : null)
  }

  close_folder_option (){
    this.is_show.set(false)
    this.folder.set(null);
    this.file.set(null)
  }

}
