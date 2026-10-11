import { Injectable, signal } from '@angular/core';
import { LanguageSettings } from '../interfaces/language-interface';
import { invoke } from '@tauri-apps/api/core';

@Injectable({
  providedIn: 'root',
})
export class LanguageServices {
  data = signal<LanguageSettings | undefined>(undefined);
  current_language = signal<string>('en');

  async init() {
    await invoke('get_language', {})
      .then((v) => {
        this.data.set(v as unknown as LanguageSettings);
      })
      .catch((e) => {
        console.error(e);
      });
  }
}
