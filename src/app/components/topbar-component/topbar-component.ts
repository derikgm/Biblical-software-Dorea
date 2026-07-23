import { Component, ElementRef, inject, signal, ViewChild, } from '@angular/core';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { heroMagnifyingGlass, heroMinus, heroPlus } from "@ng-icons/heroicons/outline"
import { FontSettingsServices } from '../../services/font_settings-services';
import { LanguageServices } from '../../services/language-services';
import { BibleServices } from '../../services/bible-services';

@Component({
  selector: 'topbar-component',
  imports: [NgIcon],
  templateUrl: './topbar-component.html',
  styleUrl: './topbar-component.css',
  providers: [
    provideIcons({
      plus: heroPlus,
      minus: heroMinus,
      search: heroMagnifyingGlass
    })
  ]
})
export class TopbarComponent {
  @ViewChild("search_input") search_input!: ElementRef<HTMLInputElement>;

  font_settings_services = inject(FontSettingsServices);
  lang = inject(LanguageServices);
  bible_services = inject(BibleServices);

  change_to = signal(this.lang.data()?.change_to);

  async search_in_bible(){
    await this.bible_services.search_in_bible(this.search_input.nativeElement.value as string);
  }
}

