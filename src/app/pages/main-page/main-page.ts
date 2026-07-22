import { AfterViewInit, ChangeDetectionStrategy, Component, computed, ElementRef, EventEmitter, HostListener, 
  inject, Output, QueryList, signal, ViewChild, ViewChildren } from '@angular/core';
import { FontSettingsServices } from '../../services/font_settings-services';
import { MarkerComponent } from '../../components/marker-component/marker-component';
import { BibleServices } from '../../services/bible-services';
import { Chapter } from '../../interfaces/bible-interface';
import { VisibleDirective } from "../../directives/visible-directive";
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroBars3, heroBars3CenterLeft, heroEquals, heroPause } from '@ng-icons/heroicons/outline';
import { BibleOptionComponent } from "../../components/bible_option-component/bible_option-component";

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
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainPage implements AfterViewInit{
  @ViewChild('text_option') text_option!: ElementRef<HTMLDivElement>;
  @ViewChildren('versiculo') versiculos!: QueryList<ElementRef<HTMLParagraphElement>>;
  @ViewChildren('chap_header') chap_headers!: QueryList<ElementRef<HTMLParagraphElement>>;

  rangeSelected!: Range | undefined;
  visibility_range: number[] = [];

  fontSettingsServices = inject(FontSettingsServices);
  bible_services = inject(BibleServices);

  // headers = map_headers;
  isMakerOpen = signal<boolean>(false);
  first_init = signal<boolean>(true)
  xPosition = signal<number>(0);
  yPosition = signal<number>(0);

  ngAfterViewInit(): void {
    document.addEventListener('click', ()=>{
      this.isMakerOpen.set(!document.getSelection()?.isCollapsed);
    })

    this.chap_headers.changes.subscribe(()=>{
      this.chap_headers.get(this.bible_services.current_chapter() - 1)
      ?.nativeElement.scrollIntoView(true);
      this.visibility_range = [];
      this.visibility_range.push(this.bible_services.current_chapter());
    }) 

  }

  handler_chapter_visibility(chapter: number, visible: boolean) {

    if(visible == false && this.visibility_range.length == 1)
      return

    if(visible){
      if(chapter < this.visibility_range[0]){
        this.visibility_range.unshift(chapter);
        this.bible_services.current_chapter.set(chapter);
      }

      if(this.visibility_range.at(-1)! < chapter){
        this.visibility_range.push(chapter);
      }

    } else {
      if(chapter <= this.visibility_range[0]){
        this.visibility_range.shift();
        this.bible_services.current_chapter.set(chapter + 1);
      }

      if(this.visibility_range.at(-1)! < chapter){
        this.visibility_range.pop();
      }
    }
  }

  trackByFn(index: number, item: Chapter |undefined): any {
    if(item)
    return item.chapter;
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