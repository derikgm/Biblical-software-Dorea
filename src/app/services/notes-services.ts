import { Injectable } from '@angular/core';
import { Note } from '../interfaces/notes-interfaces';
import { invoke } from '@tauri-apps/api/core';

@Injectable({
  providedIn: 'root',
})
export class NotesServices {
  notes: Note[] = notes_test;

  constructor(){
    this.saveNotes();
  }

  saveNotes(){
    invoke('save_all_notes', {notes: this.notes}).then(()=>{
      console.log("nice")
    }).catch(()=>{
      console.log("En Error is ocurred");
      
    })
  }

  deleteNote(n: number){
    this.notes.splice(n, 1);

    invoke("delete_note", {id: n});
    
    this.notes = this.notes.map((note, index)=>{
      if(index >= n)
        note.id -= 1;
      return note;
    })
  }
}


const notes_test: Note[] = [
  {id: 0, title: "nota 1", text: "lorem Ipsum nomine"},
  {id: 1, title: "nota 2", text: "lorem Ipsum nomine"},
  // Nota con 51 caracteres (cuenta: 51 exactos)
  {id: 2, title: "Esto es una prueba de un titulo bien", text: "Lorem ipsum dolor sit amet consectetur adipiscing elit"},
  // Nota con 80 caracteres (cuenta: 80 exactos)
  {id: 3, title: "nota 4", text: "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor"}
]