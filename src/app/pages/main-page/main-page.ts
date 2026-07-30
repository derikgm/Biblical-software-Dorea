import { AfterViewInit, Component, computed, ElementRef, HostListener, 
  inject, OnInit, QueryList, signal, ViewChild, ViewChildren } from '@angular/core';
import { FontSettingsServices } from '../../services/font_settings-services';
import { MarkerComponent } from '../../components/marker-component/marker-component';
import { BibleServices } from '../../services/bible-services';
import { Chapter } from '../../interfaces/bible-interface';
import { VisibleDirective } from "../../directives/visible-directive";
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroBars3, heroBars3CenterLeft, heroEquals, heroPause } from '@ng-icons/heroicons/outline';
import { BibleOptionComponent } from "../../components/bible_option-component/bible_option-component";
import { GlobalSettingsServices } from '../../services/global_settings-services';
import { LanguageServices } from '../../services/language-services';

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

  @ViewChild('text_option') text_option!: ElementRef<HTMLDivElement>;
  @ViewChildren('versiculo') versiculos!: QueryList<ElementRef<HTMLParagraphElement>>;
  @ViewChildren('chap_header') chap_headers!: QueryList<ElementRef<HTMLParagraphElement>>;

  rangeSelected!: Range | undefined;
  visibility_range: number[] = [];

  fontSettingsServices = inject(FontSettingsServices);
  bible_services = inject(BibleServices);
  gss = inject(GlobalSettingsServices);
  lang = inject(LanguageServices);

  // headers = map_headers;
  isMakerOpen = signal<boolean>(false);
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
    document.addEventListener('click', ()=>{
      this.isMakerOpen.set(!document.getSelection()?.isCollapsed);
    });

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
        this.xPosition.set(event.x)
        this.yPosition.set(event.y)
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
      const start_vers =this.rangeSelected.startContainer.parentElement?.parentElement?.firstChild?.textContent ?? 0;
      const end_vers =this.rangeSelected.endContainer.parentElement?.parentElement?.firstChild?.textContent ?? 0;

      for (let i = +start_vers - 1 ; i < +end_vers; i++) {

        const node = this.versiculos.get(i)?.nativeElement.lastChild?.firstChild;

        if(node){
          const rangeAux = document.createRange();

          rangeAux.setStart(node, (i == +start_vers - 1) ? this.rangeSelected.startOffset : 0);
          rangeAux.setEnd(node, (i == +end_vers - 1) ? this.rangeSelected.endOffset : (node.textContent?.length ?? 0));

          const span = document.createElement('span');
          span.classList.add(...map_marks[color]);

          rangeAux.surroundContents(span);
        }
      }
    } else {
        const span = document.createElement('span');
        span.classList.add(...map_marks[color]);
        this.rangeSelected.surroundContents(span);
        document.getSelection()?.removeAllRanges();
    }
  }

}

const map_marks = [
  ['text-white', 'bg-red-700'],
  ['text-white', 'bg-blue-700'],
  ['text-white', 'bg-green-700'],
  ['text-white', 'bg-violet-700'],
  ['text-black', 'bg-transparent'],
]