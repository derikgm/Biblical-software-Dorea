import { AfterViewInit, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar-component/sidebar-component';
import { TopbarComponent } from './components/topbar-component/topbar-component';
import { LanguageServices } from './services/language-services';
import { BibleServices } from './services/bible-services';
import { FolderServices } from './services/folder-services';
import { SpinComponent } from './components/spin-component/spin-component';
import { GlobalSettingsServices } from './services/global_settings-services';
import { FontSettingsServices } from './services/font_settings-services';
import { SearchResultComponent } from './components/search_result-component/search_result-component';
import { FolderOptionsComponent } from './components/folder_options-component/folder_options-component';
import { MarkerServices } from './services/marker_services';
import { SearchNoteComponent } from './components/search_note-component/search_note-component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    SidebarComponent,
    TopbarComponent,
    SpinComponent,
    SearchResultComponent,
    FolderOptionsComponent,
    SearchNoteComponent,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent implements AfterViewInit {
  bible_services = inject(BibleServices);
  folder_services = inject(FolderServices);
  global_settings_services = inject(GlobalSettingsServices);
  font_settings_services = inject(FontSettingsServices);
  marker_services = inject(MarkerServices);
  language_services = inject(LanguageServices);

  async ngAfterViewInit() {
    this.global_settings_services.is_loading_the_app.set(true);

    await this.global_settings_services.init();

    await Promise.all([
      this.bible_services.init(),
      this.language_services.init(),
      this.folder_services.init(),
    ]);

    // Depende de la biblia cargada
    await this.marker_services.init();

    this.font_settings_services.init();

    this.global_settings_services.is_loading_the_app.set(false);

    window.addEventListener('keydown', (event) => {
      if (event.ctrlKey) {
        switch (event.key) {
          case 'p':
          case 'P': {
            event.preventDefault();
            this.folder_services.show_notes_searcher.update((v) => !v);
            break;
          }
          default: {
            break;
          }
        }
      }
    });
  }
}
