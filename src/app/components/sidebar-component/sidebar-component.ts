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
import { TreeFolderComponent } from '../tree_folder-component/tree_folder-component';
import { FolderServices } from '../../services/folder-services';
import { SidebarSettingsServices } from '../../services/sidebar_settings-services';
import { VerseNavigationComponent } from '../verse_navigation-component/verse_navigation-component';

@Component({
  selector: 'sidebar-component',
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
