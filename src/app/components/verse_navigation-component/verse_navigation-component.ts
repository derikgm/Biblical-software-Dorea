import { Component, inject, signal } from '@angular/core';
import { BibleServices } from '../../services/bible-services';


@Component({
  selector: 'verse-navigation-component',
  templateUrl: "./verse_navigation-component.html",
  styleUrl: './verse_navigation-component.css',

})
export class VerseNavigationComponent {
  show_chaps = signal<number>(-1);

  bible_services = inject(BibleServices);

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

}
