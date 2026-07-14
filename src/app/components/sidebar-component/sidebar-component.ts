import { Component, computed, HostListener, inject, signal, } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  heroBookOpen,
  heroSun,
  heroMoon,
  heroCog8Tooth,
  heroDocumentText
} from '@ng-icons/heroicons/outline';
import { ThemeServices } from '../../services/theme-services';
import { RouterLink, RouterLinkActive } from "@angular/router";
import { TreeFolderComponent } from "../tree_folder-component/tree_folder-component";
import { Folder } from '../../interfaces/tree_folder-interfaces';
import { FolderOptionsComponent } from "../folder_options-component/folder_options-component";
import { FolderServices } from '../../services/folder-services';
import { SettingsServices } from '../../services/settings-services';


@Component({
  selector: 'sidebar-component',
  imports: [NgIconComponent, RouterLink, RouterLinkActive, TreeFolderComponent, FolderOptionsComponent],
  templateUrl: './sidebar-component.html',
  styleUrl: './sidebar-component.css',
  providers: [
    provideIcons({
      bible: heroBookOpen,
      light: heroSun,
      dark: heroMoon,
      settings: heroCog8Tooth,
      notes: heroDocumentText
    })
  ]
})
export class SidebarComponent {

  theme_services = inject(ThemeServices);
  folder_services = inject(FolderServices);
  settings_services = inject(SettingsServices);

  current_path = signal<current_path_enum>(current_path_enum.NOTES);
  root_folder = signal<Folder>(folder_test);


  ancor_handler(anchor: number){
    if(anchor == this.current_path())
      this.settings_services.extended_sidebar_open.update(v => !v);

    this.current_path.set(anchor)
  }


}

export enum current_path_enum {
  BIBLE,
  NOTES,
}

let folder_test: Folder = 
  {
    folder_name: "root",
    folders: [
      {
        folder_name:"another_files",
        files: ['file02', 'file03']
      },
      {
        folder_name: "assets",
        files: ['asset01', 'asset02'],
        folders: [{
          folder_name: "photos",
          files: ["photo01"]
        }]
      }
    ],
    files: ["file1"],
  }