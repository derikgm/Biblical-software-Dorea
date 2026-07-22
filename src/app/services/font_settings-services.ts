import { inject, Injectable, signal } from '@angular/core';
import { GlobalSettingsServices } from './global_settings-services.ts';

@Injectable({
  providedIn: 'root',
})
export class FontSettingsServices {
  font_size = signal<number>(16);
  is_inline = signal<boolean>(true);

  gss = inject(GlobalSettingsServices);

  init(){
    this.font_size.set(this.gss.settings.font_size)
    this.is_inline.set(!this.gss.settings.bible_form_lineal)
  }

  changeSize(direction: boolean){
    this.font_size.update(v => (direction) ? v+1 : v-1);
    this.gss.save_font_size(this.font_size());
  }

  changeSizeNumber(new_value: number){
    this.font_size.set(new_value);
    this.gss.save_font_size(this.font_size());
  }

  change_bible_form(is_inline: boolean){
    this.is_inline.set(is_inline);
  }
}
