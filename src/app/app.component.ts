import { AfterViewInit, Component, ElementRef, HostListener, inject, signal } from "@angular/core";
import { RouteReuseStrategy, RouterOutlet } from "@angular/router";
import { SidebarComponent } from "./components/sidebar-component/sidebar-component";
import { TopbarComponent } from "./components/topbar-component/topbar-component";
import { LanguageServices } from "./services/language-services";
import { SidebarSettingsServices } from "./services/sidebar_settings-services";
import { BibleServices } from "./services/bible-services";
import { FolderServices } from "./services/folder-services";
import { SpinComponent } from "./components/spin-component/spin-component";
import { GlobalSettingsServices } from "./services/global_settings-services";
import { FontSettingsServices } from "./services/font_settings-services";
import { SearchResultComponent } from "./components/search_result-component/search_result-component";
import { FolderOptionsComponent } from "./components/folder_options-component/folder_options-component";
import { CustomRouteReuseStrategy } from "./stratergies/custom-route-reuse.strategy";
import { MarkerServices } from "./services/marker_services";
import { SearchNoteComponent } from "./components/search_note-component/search_note-component";

@Component({
  selector: "app-root",
  providers:[
    // {provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy}
  ],
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, SpinComponent, SearchResultComponent, FolderOptionsComponent, SearchNoteComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent implements AfterViewInit{
  language_services = inject(LanguageServices);
  settings_services = inject(SidebarSettingsServices);
  bible_services = inject(BibleServices);
  folder_services = inject(FolderServices);
  global_settings_services = inject(GlobalSettingsServices);
  font_settings_services = inject(FontSettingsServices);
  marker_services = inject(MarkerServices);

  async ngAfterViewInit() {
    this.global_settings_services.is_loading_the_app.set(true);

    await this.global_settings_services.init();
    await this.bible_services.init();
    await this.marker_services.init();
    await this.language_services.init();
    await this.folder_services.init();
    
    this.font_settings_services.init();

    this.global_settings_services.is_loading_the_app.set(false);

    window.addEventListener("keydown", (event) => {

    if(event.key == "p")
      if(event.ctrlKey){
        event.preventDefault();
        this.folder_services.show_notes_searcher.update(v => !v)
      }
    })

  }

  @HostListener('keydown', ['$event'])
  disable_sidebar_rezising_event(event: KeyboardEvent){

  }

  // @HostListener('mouseup')
  // disable_sidebar_rezising_event(){
  //   this.settings_services.disable_resizing();
  // }
}
