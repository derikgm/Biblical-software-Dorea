import { Injectable, signal } from '@angular/core';

const THEME_STORAGE_KEY = 'dorea_theme';

function apply_theme(dark: boolean) {
  if (dark) document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
}

@Injectable({
  providedIn: 'root',
})
export class ThemeServices {
  theme = signal<boolean>(localStorage.getItem(THEME_STORAGE_KEY) === 'dark');

  constructor() {
    apply_theme(this.theme());
  }

  changeTheme() {
    this.theme.update((t) => {
      const next = !t;
      apply_theme(next);
      localStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light');
      return next;
    });
  }
}
