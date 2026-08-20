import { inject, Injectable, signal } from '@angular/core';
import { Folder, Note } from '../interfaces/tree_folder-interfaces';
import { invoke } from '@tauri-apps/api/core';

@Injectable({
  providedIn: 'root',
})
export class FolderServices {

  // Folder signals
  show_file_and_folder_options = signal<boolean>(false);
  is_from_extended_sidebar = signal<boolean>(false);
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
    extension: '',
    dir: '',
    linked_marks: []
  });
  file_to_rename = signal<Note | null>(null);
  file_to_create = signal<Note | null>(null);
  folder_to_rename = signal<Folder | null>(null);
  folder_to_create = signal<Folder | null>(null);
  notes_array = signal<Note[]>([]); 

  //notes_searcher
  show_notes_searcher = signal(false);
  is_from_link_note = false;

  async init(){
    await invoke<Folder>("get_notes_folders", {}).then((v) => {
      this.folder_root.set(v);

      set_notes_array(this.folder_root()!, this.notes_array());
    })
  }

  show_folder_option (x: number = 0, y: number = 0, folder_selected: Folder | undefined, index: number){
    this.show_file_and_folder_options.set(true);
    this.x_position.set(x)
    this.y_position.set(y)
    this.folder_selected.set(folder_selected ?? null);
    this.file.set( (folder_selected?.files && index != -1) ? folder_selected.files[index] : null)
  }

  show_folder_option_from_extended_sidebar(x: number = 0, y: number = 0){
    this.show_file_and_folder_options.set(true);
    this.is_from_extended_sidebar.set(true);
    this.x_position.set(x)
    this.y_position.set(y)
    this.folder_selected.set(this.folder_root() ?? null);
  }

  close_folder_option (){
    this.show_file_and_folder_options.set(false)
    this.is_from_extended_sidebar.set(false);
    this.folder_selected.set(null);
    this.file.set(null)
  }

  open_file(note: Note, folder: Folder | undefined){
    // const dir: string = `${folder?.dir}/${note.title}.${note.extension}`;
    const dir = note.dir;

    console.log(note);

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

  enable_create_folder(){
    if(!this.folder_selected())
      this.folder_selected.set(this.folder_root()!);

    const new_folder: Folder = {
      folder_name: '',
      dir: '',
      folders: [],
      files: []
    };

    this.folder_selected()?.folders.push(new_folder);
    this.folder_to_create.set(new_folder);

    this.show_file_and_folder_options.set(false)
    this.is_from_extended_sidebar.set(false);
  }

  enable_create_note(){
    if(!this.folder_selected())
      this.folder_selected.set(this.folder_root()!);

    const new_note: Note = {
      title: '<>',
      extension: 'txt',
      dir: "",
      linked_marks: [],
    };

    this.folder_selected()?.files.push(new_note);
    this.file_to_create.set(new_note);

    this.show_file_and_folder_options.set(false)
    this.is_from_extended_sidebar.set(false);
  }

  finish_to_create(){
    this.file_to_create()
    ? this.folder_selected()?.files.pop()
    : this.folder_selected()?.folders.pop();

    this.file_to_create.set(null);
    this.folder_to_create.set(null);
  }

  create_new_note(file_name: string){
    if(!this.folder_selected())
      this.folder_selected.set(this.folder_root()!);

    const dir = this.folder_selected()?.dir;

    invoke<Note>("create_new_note", {dir, title: file_name, extension: "txt"})
    .then((res)=>{
      const new_note = res;
      
      if(this.file_to_create()){
        this.file_to_create.update(n => {
          n!.title = new_note.title;
          n!.extension = new_note.extension;
          n!.dir = new_note.dir;
  
          return n;
        })
      } else {
        this.folder_root()?.files.push(new_note)
      }

      this.notes_array.update((map) => {
        map.push(new_note);
        return map;
      });

      this.current_content.set("");
      this.current_note.set(new_note);
      this.current_dir.set(dir ?? "");
      this.file_to_create.set(null);
      this.close_folder_option();
    });
  }

  async create_new_folder(folder_name: string){
    const dir = this.folder_selected()?.dir;

    console.log(dir);

    await invoke("create_new_folder", {dir, folder: folder_name})
    .then((res) => {
      const new_folder: string = res as string;

      this.folder_to_create.update((folder) => {
        if(!folder) return null;

        folder.folder_name = new_folder;
        folder.dir = dir + "/" + folder_name;
        folder.folders = [];
        folder.files = [];
        
        return folder;
      })

      this.folder_to_create.set(null);
    })

    this.close_folder_option();
  }

  enabled_rename_file_or_folder(){
    if(this.file()){
      this.file_to_rename.set(this.file());
    } else {
      this.folder_to_rename.set(this.folder_selected());  
    }
    this.show_file_and_folder_options.set(false)
  }
  
  finish_to_rename(){
    this.file_to_rename.set(null);
    this.folder_to_rename.set(null);
  }

  //Note Searcher
  link_note(){
    this.is_from_link_note = true;
    this.show_notes_searcher.set(true);
  }

  async update_file_name(dir: string, newDir: string, new_title: string){
    invoke("update_file_name", {
      dir,
      newDir
    }).then(()=>{
      this.folder_selected.update((folder) => {
        folder?.files.forEach((f) => {
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

function set_notes_array(folder: Folder, notes_array: Note[]) {
  folder.files.forEach((n) => {
    notes_array.push(n);
  })

  folder.folders.forEach((f) => {
    set_notes_array(f, notes_array);
  })
}