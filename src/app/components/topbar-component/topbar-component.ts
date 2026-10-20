import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { heroMagnifyingGlass, heroMinus, heroPlus } from '@ng-icons/heroicons/outline';
import { FontSettingsServices } from '../../services/font-settings-services';
import { BibleServices } from '../../services/bible-services';
import { GlobalSettingsServices } from '../../services/global-settings-services';

@Component({
  selector: 'app-topbar',
  imports: [NgIcon],
  templateUrl: './topbar-component.html',
  styleUrl: './topbar-component.css',
  providers: [
    provideIcons({
      plus: heroPlus,
      minus: heroMinus,
      search: heroMagnifyingGlass,
    }),
  ],
})
export class TopbarComponent {
  @ViewChild('search_input') search_input!: ElementRef<HTMLInputElement>;

  font_settings_services = inject(FontSettingsServices);
  bible_services = inject(BibleServices);
  global_settings_services = inject(GlobalSettingsServices);

  async search_in_bible() {
    this.global_settings_services.is_loading.set(true);
    const value = this.search_input.nativeElement.value;
    this.search_input.nativeElement.value = '';

    try {
      await this.bible_services.search_in_bible(value);
    } finally {
      this.global_settings_services.is_loading.set(false);
    }
  }
}
