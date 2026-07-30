import { Injectable, signal } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';

@Injectable({
  providedIn: 'root',
})
export class GlobalSettingsServices {
  settings: Settings = {
    font_size: 16,
    bible_form_lineal: false,
    current_book: 1,
    current_chapter: 1,
    current_bible: "",
  };

  is_loading = signal(false);

  async init(){
    this.settings = await invoke('get_settings');
  }

  async save_settings(){
    invoke("save_settings", {settings: this.settings})
  }

  save_font_size(n: number){
    this.settings.font_size = n;
    this.save_settings();
  }

  async save_current_chapter(book: number, chapter: number ){
    this.settings.current_book = book;
    this.settings.current_chapter = chapter;

    this.save_settings();
  }

}
export interface Settings {
    font_size: number,
    bible_form_lineal: boolean, 
    current_book: number,
    current_chapter: number,
    current_bible: string,
}