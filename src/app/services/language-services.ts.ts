import { Injectable, signal } from '@angular/core';
import { LanguageSettings } from '../interfaces/language-interface';
import { invoke } from '@tauri-apps/api/core';

@Injectable({
  providedIn: 'root',
})
export class LanguageServices {
  data = signal<LanguageSettings | undefined>(undefined);
  current_language = signal<string>("en");

  async init(){
    const v: LanguageSettings = await invoke('get_language', {});
    this.data.set(v);
  }
}
