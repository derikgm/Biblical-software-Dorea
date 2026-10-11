import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/main-page/main-page').then((m) => m.MainPage),
  },
  {
    path: 'notes',
    loadComponent: () => import('./pages/notes-page/notes-page').then((m) => m.NotesPage),
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings-page/settings-page').then((m) => m.SettingsPage),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
