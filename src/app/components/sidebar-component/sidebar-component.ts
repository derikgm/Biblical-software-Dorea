import { Component, inject } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroBookOpen,
  heroSun,
  heroMoon,
  heroCog8Tooth,
  heroDocumentText,
} from '@ng-icons/heroicons/outline';
import { ThemeServices } from '../../services/theme-services';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TreeFolderComponent } from '../tree-folder-component/tree-folder-component';
import { FolderServices } from '../../services/folder-services';
import { SidebarSettingsServices } from '../../services/sidebar-settings-services';
import { VerseNavigationComponent } from '../verse-navigation-component/verse-navigation-component';

@Component({
  selector: 'app-sidebar',
  imports: [
    NgIconComponent,
    RouterLink,
    RouterLinkActive,
    TreeFolderComponent,
    VerseNavigationComponent,
  ],
  templateUrl: './sidebar-component.html',
  providers: [
    provideIcons({
      bible: heroBookOpen,
      light: heroSun,
      dark: heroMoon,
      settings: heroCog8Tooth,
      notes: heroDocumentText,
    }),
  ],
})
export class SidebarComponent {
  theme_services = inject(ThemeServices);
  folder_services = inject(FolderServices);
  sidebar_settings_services = inject(SidebarSettingsServices);

  ancor_handler(anchor: number) {
    this.sidebar_settings_services.anchor_handler(anchor);
  }
}
