import { AfterViewInit, Component, computed, ElementRef, HostListener, 
  inject, OnInit, QueryList, signal, ViewChild, ViewChildren } from '@angular/core';
import { FontSettingsServices } from '../../services/font_settings-services';
import { MarkerComponent } from '../../components/marker-component/marker-component';
import { BibleServices } from '../../services/bible-services';
import { Chapter, Mark } from '../../interfaces/bible-interface';
import { VisibleDirective } from "../../directives/visible-directive";
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroBars3, heroBars3CenterLeft, heroEquals, heroPause } from '@ng-icons/heroicons/outline';
import { BibleOptionComponent } from "../../components/bible_option-component/bible_option-component";
import { GlobalSettingsServices } from '../../services/global_settings-services';
import { LanguageServices } from '../../services/language-services';
import { invoke } from '@tauri-apps/api/core';
import { MarkerServices } from '../../services/marker_services';

@Component({
  selector: 'main-page',
  imports: [MarkerComponent, VisibleDirective, BibleOptionComponent],
  providers: [
    provideIcons({
      row: heroBars3,
      lineal: heroBars3CenterLeft,
      right: heroEquals,
      top: heroPause,
    })
  ],
  templateUrl: './main-page.html',
  styleUrl: './main-page.css',
})
export class MainPage implements AfterViewInit{

  @ViewChild('marker_component') marker_component!: ElementRef<HTMLElement>;
  @ViewChildren('versiculo') versiculos!: QueryList<ElementRef<HTMLParagraphElement>>;
  @ViewChildren('chap_header') chap_headers!: QueryList<ElementRef<HTMLParagraphElement>>;
  @ViewChildren('div_chapter') div_chapter!: QueryList<ElementRef<HTMLDivElement>>;

  rangeSelected!: Range | undefined;
  visibility_range: number[] = [];

  fontSettingsServices = inject(FontSettingsServices);
  bible_services = inject(BibleServices);
  marker_services = inject(MarkerServices);
  gss = inject(GlobalSettingsServices);
  lang = inject(LanguageServices);

  // headers = map_headers;
  is_marker_open = signal<boolean>(false);
  first_init = signal<boolean>(true)
  xPosition = signal<number>(0);
  yPosition = signal<number>(0);
  
  scrolling = false;
  current_chapter = 0;

  current_book = this.bible_services.current_book;

  ngOnInit(): void {
    setTimeout(() => {
      if(this.bible_services.is_jumped_from_note_page())
        this.bible_services.move_to_chapter(
          (this.bible_services.current_book()?.nr ?? 1),
          this.bible_services.current_chapter(),
        );

      this.bible_services.is_jumped_from_note_page.set(true);
    }, 0);
  }

  ngAfterViewInit(): void {
    document.addEventListener('mouseup', ()=>{
      // this.is_marker_open.set(!document.getSelection()?.isCollapsed && !this.is_marker_open());
      console.log(!document.getSelection()?.isCollapsed);
      console.log(this.is_marker_open());
      
      if(!document.getSelection()?.isCollapsed)
        this.is_marker_open.set(true);
      else 
        this.is_marker_open.set(false)

      // console.log(this.xPosition());
      // console.log(this.yPosition());
    });

    window.addEventListener("resize", (event) => {
      event.preventDefault();

      const current_chapter = this.current_chapter;
      this.scrolling = true;

      requestAnimationFrame(() => {
        setTimeout(() => {
          this.bible_services.move_to_chapter(
            (this.bible_services.current_book()?.nr ?? 1),
            current_chapter,
          );

          this.current_chapter = current_chapter;
        }, 100)
      })
    })

    this.bible_services.select_verse_to_move$.subscribe((verse_id) => {
      requestAnimationFrame(() => {
        setTimeout(()=>{
          this.scrolling = true;

          const verse = this.versiculos.find(el => el.nativeElement.id == verse_id)?.nativeElement;
          
          if(!verse) return;

          verse.scrollIntoView(true);
          verse.classList.add("bg-blue-400")

          const observer = new IntersectionObserver((entries) => {
            entries.forEach((entrie) => {
              if(entrie.isIntersecting){
                this.current_chapter = this.bible_services.current_chapter()
                this.scrolling = false;
                observer.disconnect();
              }
            })
          });

          observer.observe(verse)
          setTimeout(()=>{verse.classList.remove("bg-blue-400")}, 3000)

          this.apply_marks()
        }, 0);
      })
    })

    this.bible_services.select_chapter_to_move$.subscribe((chapter_id) => {
      requestAnimationFrame(() => {
        setTimeout(()=>{
          this.scrolling = true;

          const chapter = this.chap_headers.find(el => el.nativeElement.id == chapter_id)?.nativeElement;
          
          if(!chapter) return
          
          chapter.scrollIntoView(true);

          const observer = new IntersectionObserver((entries) => {
            entries.forEach((entrie) => {

              if(entrie.isIntersecting){
                this.current_chapter = this.bible_services.current_chapter()
                this.scrolling = false;
                chapter_id = ""
                observer.disconnect();
              }
            })
          }, 
        );
          observer.observe(chapter)

          this.apply_marks()

        }, 0);
      })
    })

  }

  handler_chapter_visibility(chapter: number, visible: boolean) {
    if(this.scrolling) return;

    if(!visible){
      if(chapter == this.current_chapter){
        this.current_chapter = chapter + 1;
        this.bible_services.current_chapter.set(chapter + 1)
        this.gss.save_current_chapter((this.current_book()?.nr ?? 1) - 1, chapter + 1);
      }
    } else {
      if(chapter == this.current_chapter - 1){
        this.current_chapter = chapter;
        this.bible_services.current_chapter.set(chapter)
        this.gss.save_current_chapter((this.current_book()?.nr ?? 1) - 1, chapter);
      }
    }
  }

  showMarker(event: MouseEvent){
    if(document.getSelection() && !document.getSelection()?.isCollapsed){
        this.rangeSelected = document.getSelection()?.getRangeAt(0);
        this.xPosition.set(event.layerX)
        this.yPosition.set(event.layerY)

        console.log(this.marker_component.nativeElement);
        
      }
  }

  @HostListener('wheel', ['$event'])
  changeFontSize(event: WheelEvent){
    if (event.ctrlKey) {
      event.preventDefault(); // Por si acaso...
      this.fontSettingsServices.changeSize(event.deltaY > 0 ? false : true);
    }
  }

  fixSelection(){
    if(this.rangeSelected){
      const startText = this.rangeSelected.startContainer.textContent;
      const endText = this.rangeSelected.endContainer.textContent;
      let startOffset = this.rangeSelected.startOffset;
      let endOffset = this.rangeSelected.endOffset - 1;

      while(startText?.at(startOffset) !== " ")
        startOffset -= 1;

      while(endText?.at(endOffset) !== " ")
        endOffset += 1;
      
      this.rangeSelected.setStart(this.rangeSelected.startContainer, startOffset + 1);
      this.rangeSelected.setEnd(this.rangeSelected.endContainer, endOffset);
    }
    
  }

  handlerSelected(color: number){
    
    if(this.versiculos.length == 0) return
    if(this.rangeSelected === undefined) return;

    if(this.rangeSelected.endContainer !== this.rangeSelected.startContainer){
      const chap_parent = this.rangeSelected.startContainer.parentElement?.parentElement?.parentElement! as HTMLDivElement;

      const start_verse = this.rangeSelected.startContainer.parentElement?.parentElement?.firstChild?.textContent ?? 0;
      const end_verse = this.rangeSelected.endContainer.parentElement?.parentElement?.firstChild?.textContent ?? 0;

      paint_several_sections(
        chap_parent,
        +start_verse - 1,
        +end_verse - 1,
        this.rangeSelected.startOffset,
        this.rangeSelected.endOffset,
        color
      );

      this.marker_services.save_mark(
        color, 
        +start_verse - 1, 
        +end_verse - 1, 
        this.rangeSelected.startOffset, 
        this.rangeSelected.endOffset
      );

    } else {
      const verse = this.rangeSelected.startContainer.parentElement?.parentElement?.firstChild?.textContent ?? 1

      this.marker_services.save_mark(
        color,
        +verse - 1,
        +verse - 1,
        this.rangeSelected.startOffset,
        this.rangeSelected.endOffset
      );

      const span = document.createElement('span');
      span.classList.add(...map_marks[color]);
      
      this.rangeSelected.surroundContents(span);
      document.getSelection()?.removeAllRanges();
    }

  }

  apply_marks() {
    requestAnimationFrame(() => {
      setTimeout(() => {
        const marks = this.marker_services.marks.get(this.current_chapter);

        if(marks){

          marks.forEach((m) => {
            const chapter = this.div_chapter.get(m.chapter)

            if(m.end_verse == m.start_verse){
              //NOTE: El texto plano dentro del span cuenta como nodo ._.
              const node = chapter?.nativeElement.childNodes[m.start_verse + 1].lastChild?.lastChild
  
              if(node){
                paint_seccion(node, m.start, m.end, m.style);
              }
            } else {
              paint_several_sections(
                chapter?.nativeElement,
                m.start_verse,
                m.end_verse,
                m.start,
                m.end,
                m.style
              );
            }
          })
        }
      }, 0)
    })
    
  }
}

function paint_seccion(node: ChildNode, start: number, end: number, style: number) {
  const range = document.createRange();

  const span = document.createElement('span');
  span.classList.add(...map_marks[style]);

  range.setStart(node, start);
  range.setEnd(node, end);
  
  range.surroundContents(span);
}

function paint_several_sections (
  chapter_html_div: HTMLDivElement | undefined,
  start_verse: number,
  end_verse: number,
  start_mark: number,
  end_mark: number,
  style: number,
) {

  if(!chapter_html_div) return;

  start_verse++;
  end_verse++;

  for (let i = start_verse; i <= end_verse; i++) {
    const node = chapter_html_div.childNodes[i]?.lastChild?.lastChild

    if(node){
      const start = (i == start_verse) ? start_mark : 0;
      const end = (i == end_verse) ? end_mark : (node.textContent?.length ?? 0);
      
      paint_seccion(node, start, end, style);
    }
  }
}

const map_marks = [
  ['hover:cursor-pointer', 'text-white', 'bg-red-700'],
  ['hover:cursor-pointer', 'text-white', 'bg-blue-700'],
  ['hover:cursor-pointer', 'text-white', 'bg-green-700'],
  ['hover:cursor-pointer', 'text-white', 'bg-violet-700'],
  ['hover:cursor-pointer', 'text-black', 'bg-transparent'],
]