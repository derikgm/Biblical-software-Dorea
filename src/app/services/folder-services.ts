import { inject, Injectable, signal } from '@angular/core';
import { Folder, Note } from '../interfaces/tree_folder-interfaces';
import { invoke } from '@tauri-apps/api/core';

@Injectable({
  providedIn: 'root',
})
export class FolderServices {

  // Folder signals
  is_show = signal<boolean>(false);
  x_position = signal<number>(0);
  y_position = signal<number>(0);
  folder_selected = signal<Folder | null>(null);
  file = signal<Note | null>(null);
  directory = signal<Folder | undefined>(undefined);
  folder_root = signal<Folder | undefined>(undefined);

  // notes signals
  current_content = signal<string>("");
  old_content = signal<string>("");
  current_dir = signal<string>("");
  current_note = signal<Note>({
    title: '',
    extension: ''
  });
  file_to_rename = signal<Note | null>(null);
  folder_to_rename = signal<Folder | null>(null);

  async init(){
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

  open_file(note: Note, folder: Folder | undefined){
    const dir: string = `${folder?.dir}/${note.title}.${note.extension}`;

    invoke('get_note', {dir})
    .then((v)=> {
      this.current_content.set(v as string);
      this.old_content.set(v as string);
      this.current_dir.set(folder?.dir ?? "");

      this.current_note.set(note);
    })
    .catch(()=>{
      console.log("se rompio");
    })
  }

  create_new_note(){
    const dir = this.folder_selected()?.dir;

    invoke("create_new_note", {dir})
    .then((res)=>{
      const new_note: Note = res as unknown as Note;

      this.folder_selected.update((folder_selected) => {
        folder_selected?.files.push(new_note);
        return folder_selected;
      })
      
      this.current_content.set("");
      this.current_note.set(new_note)
      this.close_folder_option();
    });
  }

  async create_new_folder(){
    const dir = this.folder_selected()?.dir;

    await invoke("create_new_folder", {dir})
    .then((res) => {
      const new_folder: string = res as string;

      this.folder_selected.update((folder_selected) => {
        folder_selected?.folders.push({
          folder_name: new_folder,
          dir: `${dir}/${new_folder}`,
          folders: [],
          files: []
        });
        return folder_selected;
      })
    })

    this.close_folder_option();
  }

  enabled_rename_file_or_folder(){
    if(this.file()){
      this.file_to_rename.set(this.file());
    } else {
      this.folder_to_rename.set(this.folder_selected());  
    }

    this.is_show.set(false)
  }
  
  finish_to_rename(){
    this.file_to_rename.set(null);
    this.folder_to_rename.set(null);
  }

  async update_file_name(dir: string, newDir: string, new_title: string){
    invoke("update_file_name", {
      dir,
      newDir
    }).then(()=>{
      this.folder_selected.update((folder) => {
        folder?.files.forEach((f) => {
          console.log(f);
          
          if(f.title == this.current_note().title){
            f.title = new_title;
            return;
          }
        })

        return folder;
      })

      this.current_note.update(note => {
        note.title = new_title;
        return note;
      })

    }).catch((e)=>{
      console.log(e);
    })
  }

  async update_name_from_sidebar(new_title: string, is_dir: boolean){
      if(is_dir){
        const dir = `${this.folder_selected()?.dir ?? ""}`;
        const dir_split = dir.split("/");

        dir_split[dir_split.length - 1] = new_title;

        const newDir = dir_split.join("/");

        await invoke("update_file_name", {
          dir,
          newDir
        }).then(()=>{
          
          this.folder_selected.update((folder) => {
            folder!.dir = newDir;
            folder!.folder_name = new_title;

            return folder;
          })

        }).catch((e)=>{
          console.log(e);
        })

      } else {

      const dir = `${this.folder_selected()?.dir ?? ""}/${this.file()?.title}.${this.file()?.extension}`;
      const newDir = `${this.folder_selected()?.dir ?? ""}/${new_title}.${this.file()?.extension}`;

      invoke("update_file_name", {
        dir,
        newDir
      }).then(()=>{
        this.folder_selected.update((folder) => {
          folder?.files.forEach((f) => {
            if(f.title == this.file()?.title){
              f.title = new_title;
              return;
            }
          })

          return folder;
        })

      }).catch((e)=>{
        console.log(e);
      })
    }

    this.finish_to_rename();
  }

  async delete_folder_or_file(){

    let dir = this.folder_selected()!.dir;
    let isDir = true;

    if(this.file()){
      isDir = false;
      dir = `${dir}/${this.file()?.title}.${this.file()?.extension}`;
    }

    await invoke("delete_note", {dir, isDir})
    .then(() => {
      if(isDir) {

        let parent_folder: Folder = this.folder_root()!;
        let dir_split_iter = dir.split("/");

        const folder_to_remove = dir_split_iter.pop();

        for (const dir_folder of dir_split_iter) {
          for (const folder of parent_folder.folders) {
            if(folder.folder_name == dir_folder){
              parent_folder = folder;
              break;
            }
          }
        }
      parent_folder.folders = parent_folder.folders.filter((f) => f.folder_name !== folder_to_remove);    
      } else {
        this.folder_selected.update((folder) => {
          folder?.files.forEach((f, i) => {
            if(f.title == this.file()?.title){
              folder!.files.splice(i, 1);
            }
          })
  
          return folder;
        })
      }
    })
    .catch((e) => {
      console.log(e);
    })
    this.close_folder_option();
  }

}
