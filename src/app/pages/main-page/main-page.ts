import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  OnDestroy,
  QueryList,
  signal,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FontSettingsServices } from '../../services/font_settings-services';
import { MarkerComponent } from '../../components/marker-component/marker-component';
import { BibleServices } from '../../services/bible-services';
import { VisibleDirective } from '../../directives/visible-directive';
import { provideIcons } from '@ng-icons/core';
import { heroBars3, heroBars3CenterLeft, heroEquals, heroPause } from '@ng-icons/heroicons/outline';
import { BibleOptionComponent } from '../../components/bible_option-component/bible_option-component';
import { GlobalSettingsServices } from '../../services/global_settings-services';
import { LanguageServices } from '../../services/language-services';
import { MarkerServices } from '../../services/marker_services';
import { MarkOptionsComponent } from '../../components/mark_options-component/mark_options-component';

@Component({
  selector: 'main-page',
  imports: [MarkerComponent, VisibleDirective, BibleOptionComponent, MarkOptionsComponent],
  providers: [
    provideIcons({
      row: heroBars3,
      lineal: heroBars3CenterLeft,
      right: heroEquals,
      top: heroPause,
    }),
  ],
  templateUrl: './main-page.html',
})
export class MainPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mark_options_component') mark_options_component!: ElementRef<HTMLDivElement>;
  @ViewChild('marker_component') marker_component!: ElementRef<HTMLDivElement>;
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

  first_init = signal<boolean>(true);
  is_marker_open = signal<boolean>(false);
  x_marker_position = signal<number>(0);
  y_marker_position = signal<number>(0);

  is_mark_options_open = signal<boolean>(false);
  x_mark_options_position = signal<number>(0);
  y_mark_options_position = signal<number>(0);

  scrolling = false;
  current_chapter = 0;

  current_book = this.bible_services.current_book;

  destroy_ref = inject(DestroyRef);

  private on_resize = (event: Event) => {
    event.preventDefault();

    const current_chapter = this.current_chapter;
    this.scrolling = true;

    requestAnimationFrame(() => {
      setTimeout(() => {
        this.bible_services.move_to_chapter(
          this.bible_services.current_book()?.nr ?? 1,
          current_chapter,
        );

        this.current_chapter = current_chapter;
      }, 100);
    });
  };

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.on_resize);
  }

  ngOnInit(): void {
    setTimeout(() => {
      if (this.bible_services.is_jumped_from_note_page())
        this.bible_services.move_to_chapter(
          this.bible_services.current_book()?.nr ?? 1,
          this.bible_services.current_chapter(),
        );

      this.bible_services.is_jumped_from_note_page.set(true);
    }, 0);
  }

  ngAfterViewInit(): void {
    window.addEventListener('resize', this.on_resize);

    this.bible_services.select_verse_to_move$
      .pipe(takeUntilDestroyed(this.destroy_ref))
      .subscribe((verse_id) => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            this.scrolling = true;

            const verse = this.versiculos.find(
              (el) => el.nativeElement.id == verse_id,
            )?.nativeElement;

            if (!verse) return;

            verse.scrollIntoView(true);
            verse.classList.add('bg-blue-400');

            const observer = new IntersectionObserver((entries) => {
              entries.forEach((entrie) => {
                if (entrie.isIntersecting) {
                  this.current_chapter = this.bible_services.current_chapter();
                  this.scrolling = false;
                  observer.disconnect();
                }
              });
            });

            observer.observe(verse);
            setTimeout(() => {
              verse.classList.remove('bg-blue-400');
            }, 3000);

            this.apply_marks();
          }, 0);
        });
      });

    this.bible_services.select_chapter_to_move$
      .pipe(takeUntilDestroyed(this.destroy_ref))
      .subscribe((chapter_id) => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            this.scrolling = true;

            const chapter = this.chap_headers.find(
              (el) => el.nativeElement.id == chapter_id,
            )?.nativeElement;

            if (!chapter) return;

            chapter.scrollIntoView(true);

            const observer = new IntersectionObserver((entries) => {
              entries.forEach((entrie) => {
                if (entrie.isIntersecting) {
                  this.current_chapter = this.bible_services.current_chapter();
                  this.scrolling = false;
                  chapter_id = '';
                  observer.disconnect();
                }
              });
            });
            observer.observe(chapter);

            this.apply_marks();
          }, 0);
        });
      });
  }

  handler_chapter_visibility(chapter: number, visible: boolean) {
    if (this.scrolling) return;

    if (!visible) {
      if (chapter == this.current_chapter) {
        this.current_chapter = chapter + 1;
        this.bible_services.current_chapter.set(chapter + 1);
        this.gss.save_current_chapter((this.current_book()?.nr ?? 1) - 1, chapter + 1);
      }
    } else {
      if (chapter == this.current_chapter - 1) {
        this.current_chapter = chapter;
        this.bible_services.current_chapter.set(chapter);
        this.gss.save_current_chapter((this.current_book()?.nr ?? 1) - 1, chapter);
      }
    }
  }

  onMouseUp(event: MouseEvent) {
    this.showMarker(event);
    this.fixSelection();
    this.close_mark_options();
  }

  showMarker(event: MouseEvent) {
    if (document.getSelection() && !document.getSelection()?.isCollapsed) {
      this.rangeSelected = document.getSelection()?.getRangeAt(0);
      this.marker_component.nativeElement.classList.remove('hidden');

      const pos = calc_floating_options_position(
        this.marker_component.nativeElement,
        event.layerX,
        event.layerY,
      );

      this.y_marker_position.set(pos.y);
      this.x_marker_position.set(pos.x);
    } else {
      this.marker_component.nativeElement.classList.add('hidden');
    }
  }

  show_mark_options(event: MouseEvent, mark_index: number, mark_book: number) {
    this.mark_options_component.nativeElement.classList.remove('hidden');
    event.stopPropagation();

    const pos = calc_floating_options_position(
      this.mark_options_component.nativeElement,
      event.layerX,
      event.layerY,
    );

    this.marker_services.set_current_mark(mark_book, mark_index);

    this.y_mark_options_position.set(pos.y);
    this.x_mark_options_position.set(pos.x);
  }

  close_mark_options() {
    this.mark_options_component.nativeElement.classList.add('hidden');
  }

  @HostListener('wheel', ['$event'])
  changeFontSize(event: WheelEvent) {
    if (event.ctrlKey) {
      event.preventDefault(); // Por si acaso...
      this.fontSettingsServices.changeSize(event.deltaY > 0 ? false : true);
    }
  }

  fixSelection() {
    if (this.rangeSelected) {
      const startText = this.rangeSelected.startContainer.textContent;
      const endText = this.rangeSelected.endContainer.textContent;
      let startOffset = this.rangeSelected.startOffset;
      let endOffset = this.rangeSelected.endOffset - 1;

      let stop_overflow = 100;

      while (startText?.at(startOffset) !== ' ') {
        startOffset -= 1;
        if (--stop_overflow < 0) {
          console.error('Ocurrio un bucle infinito');
          return;
        }
      }

      stop_overflow = 100;

      while (endText?.at(endOffset) !== ' ') {
        endOffset += 1;
        if (--stop_overflow < 0) {
          console.error('Ocurrio un bucle infinito');
          return;
        }
      }

      this.rangeSelected.setStart(this.rangeSelected.startContainer, startOffset + 1);
      this.rangeSelected.setEnd(this.rangeSelected.endContainer, endOffset);
    }

    const end_node = this.rangeSelected?.endContainer;
    const is_verse_number = end_node?.parentElement?.tagName === 'SUP';

    if (is_verse_number) {
      this.rangeSelected = undefined;
      document.getSelection()?.removeAllRanges();
      this.marker_component.nativeElement.classList.add('hidden');
    }
  }

  handlerSelected(color: number) {
    if (this.versiculos.length == 0) return;
    if (this.rangeSelected === undefined) return;

    if (this.rangeSelected.endContainer !== this.rangeSelected.startContainer) {
      const chap_parent = this.rangeSelected.startContainer.parentElement?.parentElement
        ?.parentElement as HTMLDivElement | null;

      if (!chap_parent) return;

      const start_verse =
        this.rangeSelected.startContainer.parentElement?.parentElement?.firstChild?.textContent ??
        0;
      const end_verse =
        this.rangeSelected.endContainer.parentElement?.parentElement?.firstChild?.textContent ?? 0;

      const start = this.rangeSelected.startOffset;
      const end = this.rangeSelected.endOffset;

      const current_book_number = (this.current_book()?.nr ?? 1) - 1;

      const mark_index = this.marker_services.marks.get(current_book_number)?.length ?? 0;

      this.paint_several_sections(
        chap_parent,
        +start_verse - 1,
        +end_verse - 1,
        start,
        end,
        color,
        mark_index,
        current_book_number,
      );

      this.marker_services.save_mark(color, +start_verse - 1, +end_verse - 1, start, end);
    } else {
      const verse =
        this.rangeSelected.startContainer.parentElement?.parentElement?.firstChild?.textContent ??
        1;

      this.marker_services.save_mark(
        color,
        +verse - 1,
        +verse - 1,
        this.rangeSelected.startOffset,
        this.rangeSelected.endOffset,
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
        const marks = this.marker_services.marks.get(
          (this.bible_services.current_book()?.nr ?? 1) - 1,
        );

        if (marks) {
          marks.forEach((m, index) => {
            const chapter = this.div_chapter.get(m.chapter);

            if (m.end_verse == m.start_verse) {
              //NOTE: El texto plano dentro del span cuenta como nodo ._.
              const node =
                chapter?.nativeElement.childNodes[m.start_verse + 1].lastChild?.lastChild;

              if (node) {
                this.paint_seccion(node, m.start, m.end, m.style, index, m.book);
              }
            } else {
              this.paint_several_sections(
                chapter?.nativeElement,
                m.start_verse,
                m.end_verse,
                m.start,
                m.end,
                m.style,
                index,
                m.book,
              );
            }
          });
        }
      }, 0);
    });
  }

  paint_seccion(
    node: ChildNode,
    start: number,
    end: number,
    style: number,
    mark_index: number,
    mark_book: number,
  ) {
    const range = document.createRange();

    const span = document.createElement('span');
    span.classList.add(...map_marks[style]);

    span.onclick = (event: MouseEvent) => {
      this.show_mark_options(event, mark_index, mark_book);
    };

    range.setStart(node, start);
    range.setEnd(node, end);

    range.surroundContents(span);
  }

  paint_several_sections(
    chapter_html_div: HTMLDivElement | undefined,
    start_verse: number,
    end_verse: number,
    start_mark: number,
    end_mark: number,
    style: number,
    mark_index: number,
    mark_book: number,
  ) {
    if (!chapter_html_div) return;

    start_verse++;
    end_verse++;

    for (let i = start_verse; i <= end_verse; i++) {
      const node = chapter_html_div.childNodes[i]?.lastChild?.lastChild;

      if (node) {
        const start = i == start_verse ? start_mark : 0;
        const end = i == end_verse ? end_mark : (node.textContent?.length ?? 0);

        this.paint_seccion(node, start, end, style, mark_index, mark_book);
      }
    }
  }
}

const map_marks = [
  ['select-none', 'hover:cursor-pointer', 'text-white', 'bg-red-700'],
  ['select-none', 'hover:cursor-pointer', 'text-white', 'bg-blue-700'],
  ['select-none', 'hover:cursor-pointer', 'text-white', 'bg-green-700'],
  ['select-none', 'hover:cursor-pointer', 'text-white', 'bg-violet-700'],
  ['select-none', 'hover:cursor-pointer', 'text-black', 'bg-transparent'],
];

function calc_floating_options_position(
  nativeElement: HTMLDivElement,
  x_event: number,
  y_event: number,
) {
  const marker_width = nativeElement.getBoundingClientRect().width;
  const marker_height = nativeElement.getBoundingClientRect().height;
  const father_width = nativeElement?.parentElement?.getBoundingClientRect().width ?? 0;

  const excedent_right = father_width - (marker_width / 2 + x_event);
  const excedent_left = x_event - marker_width / 2;

  let x_pos = x_event - marker_width / 2;

  if (excedent_right < 0) x_pos = x_pos + excedent_right;
  if (excedent_left < 0) x_pos = x_pos - excedent_left;

  return {
    x: x_pos,
    y: y_event - marker_height - 12,
  };
}
