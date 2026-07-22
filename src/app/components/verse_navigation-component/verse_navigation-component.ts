import { Component, inject, signal } from '@angular/core';
import { BibleServices } from '../../services/bible-services';
import { Chapter } from '../../interfaces/bible-interface';


@Component({
  selector: 'verse-navigation-component',
  templateUrl: "./verse_navigation-component.html",
  styleUrl: './verse_navigation-component.css',

})
export class VerseNavigationComponent {
  show_chaps = signal<number>(-1);

  bible_services = inject(BibleServices);

  cont = signal(0);

  open_caps(book: number, event: MouseEvent){
    this.show_chaps.set(
      book == this.show_chaps()
      ? - 1
      : book
    );

    const element = event.target as HTMLElement;

    element.parentElement?.children[1].scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }

  establish_current_chap(chap: Chapter){
    return chap == this.bible_services.current_book()?.chapters[this.bible_services.current_chapter() - 1];
  }

}
