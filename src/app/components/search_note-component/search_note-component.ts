import { AfterViewInit, Component, computed, ElementRef, HostListener, inject, QueryList, signal, ViewChild, ViewChildren } from '@angular/core';
import { FolderServices } from '../../services/folder-services';
import { Note } from '../../interfaces/tree_folder-interfaces';
import { Router } from "@angular/router";
import { SidebarSettingsServices } from '../../services/sidebar_settings-services';
import { FocusOnCreateDirective } from '../../directives/focus-on-create.directive';


@Component({
  selector: 'search-note-component',
  imports: [FocusOnCreateDirective],
  templateUrl: "search_note-component.html",
})
export class SearchNoteComponent implements AfterViewInit{
  @ViewChild("filter_input") filter_input!: ElementRef<HTMLInputElement>;
  @ViewChild("scroll_bar") scroll_bar!: ElementRef<HTMLDivElement>;
  @ViewChild("container") container!: ElementRef<HTMLDivElement>;
  @ViewChildren("note") html_notes!: QueryList<ElementRef<HTMLInputElement>>;

  folder_and_notes_services = inject(FolderServices);
  sidebar_settings_services = inject(SidebarSettingsServices);
  notes_array = this.folder_and_notes_services.notes_array;

  filter = signal("");
  notes = signal<Note[]>([]);

  selected_item = signal<number>(-1);
  container_size = 0;
  scroll_bar_size_porcent = 0;
  scroll_bar_size_porcent2 = signal(0);
  note_size = 0;
  notes_length = 0;

  constructor(private router: Router){}

  ngAfterViewInit(): void {
    this.notes.set(this.folder_and_notes_services.notes_array())

    window.addEventListener("resize", () => {
      this.container_size = this.container.nativeElement.getBoundingClientRect().height;
      this.scroll_bar_size_porcent = this.container_size / (this.note_size * this.notes_length);
      
      if(this.scroll_bar_size_porcent * 100 >= 100)
        this.scroll_bar.nativeElement.classList.add("hidden")
      else {
        this.scroll_bar.nativeElement.classList.remove("hidden")
        this.scroll_bar.nativeElement.style.height = `${this.scroll_bar_size_porcent * 100}%`;
      }
    })

    requestAnimationFrame(() => {
      setTimeout(() => {
        this.container_size = this.container.nativeElement.getBoundingClientRect().height;

        const aux_html_note = this.html_notes.get(0)?.nativeElement;

        if(!aux_html_note) return;

        this.note_size = aux_html_note.scrollHeight;
        this.notes_length = this.html_notes.length
        this.scroll_bar_size_porcent = this.container_size / (this.note_size * this.notes_length);

        this.scroll_bar.nativeElement.style.height = `${this.scroll_bar_size_porcent * 100}%`;
      }, 0)
    })

    this.container.nativeElement.addEventListener("scroll", (event) => {
      const scroll = this.container.nativeElement.scrollTop;
      const top = `${scroll + (scroll * this.scroll_bar_size_porcent) - (this.scroll_bar_size_porcent * 10)}px`
      this.scroll_bar.nativeElement.style.top = top;
    })
  }

  handler_filter(event: KeyboardEvent){
    const notes_showed_lenght = this.notes().length;
    const key = event.key;

    if(key == "ArrowDown"){
      event.preventDefault();

      this.selected_item.update(v => (v == notes_showed_lenght - 1) ? notes_showed_lenght - 1 : ++v);
      this.apply_selector(this.selected_item(), true);

    } else if(key == "ArrowUp"){
      event.preventDefault();
      
      this.selected_item.update(v => (v <= 0 ) ? 0 : --v);
      this.apply_selector(this.selected_item(), false);

    } 
    else if(key == "Enter") { this.jump_to_note_page(this.selected_item()); } 
    else {
      this.selected_item.update(() => -1);
      const filter_notes: Note[] = [];

      let word = this.filter_input.nativeElement.value;

      if(key.length == 1) word += key;
      else if(key == "Backspace") word = word.slice(0, -1);

      this.notes_array().forEach((n) => {
        if(n.title.includes(word)) filter_notes.push(n);
      });
  
      this.notes.set(filter_notes);
      const scroll_bar_size = (this.container_size / (this.note_size * this.notes().length)) * 100

      if(scroll_bar_size >= 100)
        this.scroll_bar.nativeElement.classList.add("hidden")
      else{
        this.scroll_bar.nativeElement.classList.remove("hidden")
        const scroll_bar_size_string = `${scroll_bar_size}%`
        this.scroll_bar.nativeElement.style.height = scroll_bar_size_string;
      }
    }
  }

  jump_to_note_page(note_index: number, event: Event | null = null){
    if(event) event.stopPropagation()

    if(note_index == -1 || note_index > this.notes().length) return
    const note = this.notes()[note_index];
    
    this.folder_and_notes_services.open_file(note, undefined);
    this.sidebar_settings_services.anchor_handler(1);
    this.close();
    this.router.navigate(["/notes"]);
  }

  close() {
    this.folder_and_notes_services.show_notes_searcher.set(false);
  }

  apply_selector(current_index: number, is_up: boolean){
    const html_note = this.html_notes.get(current_index)!.nativeElement;
    const previus_html_note = this.html_notes.get(current_index + (is_up ? -1 : 1))?.nativeElement;

    html_note.classList.add("bg-note")

    if(previus_html_note) previus_html_note.classList.remove("bg-note");
    
    const long = html_note.scrollHeight * (current_index + 1);

    if(!is_up){
      const scroll_top_element = this.container.nativeElement.scrollTop;
      const round = Math.round((scroll_top_element - long) / this.note_size) +1;
      
      if(round >= 0){
        const scroll_top = (scroll_top_element - (this.note_size - (long - scroll_top_element)));
        this.container.nativeElement.scrollTop = scroll_top;
      }
    } 
    else {
      if(this.container_size <= long){
        const scroll_top = (long - this.container_size);
        this.container.nativeElement.scrollTop = scroll_top;
      }
    }
  }
}
