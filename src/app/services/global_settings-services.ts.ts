import { Injectable } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';

@Injectable({
  providedIn: 'root',
})
export class GlobalSettingsServices {
  settings: Settings = {
    font_size: 0,
    bible_form_lineal: false
  };



  async init(){
    this.settings = await invoke('get_settings');
  }

  save_settings(){
    invoke("save_settings", {settings: this.settings})
    .then(()=>{console.log("Guardado");})
  }

  save_font_size(n: number){
    this.settings.font_size = n;
    this.save_settings();
  }

}

export interface Settings {
    font_size: number,
    bible_form_lineal: boolean, 
}