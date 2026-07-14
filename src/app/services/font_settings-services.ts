import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FontSettingsServices {
  font_size = signal<number>(16);
  is_inline = signal<boolean>(true);

  changeSize(direction: boolean){
    this.font_size.update(v => (direction) ? v+1 : v-1);
  }

  changeSizeNumber(new_value: number){
    this.font_size.set(new_value)
  }

  changeFontForm(){
    this.is_inline.set(!this.is_inline());
  }
}
