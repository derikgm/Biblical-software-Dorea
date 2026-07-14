import { Component, ElementRef, input, output, ViewChild } from '@angular/core';
import { Note } from '../../interfaces/notes-interfaces';

@Component({
  selector: 'note-component',
  imports: [],
  templateUrl: './note-component.html',
  styleUrl: './note-component.css',
})
export class NoteComponent {
  note = input.required<Note>();
  close_dialog = output<number>();

  @ViewChild('text_area') text_area!: ElementRef<HTMLTextAreaElement>
  @ViewChild('title_area') title_area!: ElementRef<HTMLTextAreaElement>

  openDialog(n: number){
    this.close_dialog.emit(-1);
  }

  changeHandler(isTitle: boolean){
    if(isTitle)
      this.note().title = this.title_area.nativeElement.value;
    else
      this.note().text = this.text_area.nativeElement.value;

    console.log(this.note());
    
  }
}
