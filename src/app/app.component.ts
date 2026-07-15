import { Component, HostListener, inject, signal } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { SidebarComponent } from "./components/sidebar-component/sidebar-component";
import { TopbarComponent } from "./components/topbar-component/topbar-component";
import { LanguageServices } from "./services/language-services.ts";
import { SettingsServices } from "./services/settings-services";
import { BibleServices } from "./services/bible-services";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, SidebarComponent, TopbarComponent,],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent {
  greetingMessage = "";
  activo = true;

  loading = signal<boolean> (true);
  
  language_services = inject(LanguageServices);
  settings_services = inject(SettingsServices);
  bible_services = inject(BibleServices);

  constructor(){
    this.language_services.init().then(()=>{
      this.loading.set(false);
    }).catch((e)=>{
      console.log("Algo salio mal", e);
    });

    this.bible_services.init().then(()=>{
      console.log("Todo en orden");
    }).catch((e)=>{
      console.log("Error obteniendo biblia", e);
    })
  }

  @HostListener('mouseup')
  disable_sidebar_rezising_event(){
    this.settings_services.disable_resizing();
  }
}
