import { AfterViewInit, Component, HostListener, inject, signal } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { SidebarComponent } from "./components/sidebar-component/sidebar-component";
import { TopbarComponent } from "./components/topbar-component/topbar-component";
import { LanguageServices } from "./services/language-services";
import { SettingsServices } from "./services/sidebar_settings-services";
import { BibleServices } from "./services/bible-services";
import { FolderServices } from "./services/folder-services";
import { SpinComponent } from "./components/spin-component/spin-component";
import { GlobalSettingsServices } from "./services/global_settings-services.ts";
import { FontSettingsServices } from "./services/font_settings-services";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, SpinComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent implements AfterViewInit{
  loading = signal<boolean> (true);
  
  language_services = inject(LanguageServices);
  settings_services = inject(SettingsServices);
  bible_services = inject(BibleServices);
  folder_services = inject(FolderServices);
  global_settings_services = inject(GlobalSettingsServices);
  font_settings_services = inject(FontSettingsServices);

  async ngAfterViewInit() {
    await this.language_services.init();
    await this.bible_services.init();
    await this.folder_services.init();
    await this.global_settings_services.init();
    
    this.font_settings_services.init();

    this.loading.set(false);
  }

  @HostListener('mouseup')
  disable_sidebar_rezising_event(){
    this.settings_services.disable_resizing();
  }
}
