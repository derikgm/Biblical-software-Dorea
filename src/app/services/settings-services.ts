import { HostListener, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SettingsServices {
  min_sidebar_extended_width = 8;
  click_position_init = 0;
  sidebar_extended_size_init = 0;
  movement_capture_function = (e: MouseEvent) => {};

  extended_sidebar_open = signal<boolean>(true); //TODO: change later
  sidebar_extended_size = signal<number>(13);
  extended_sidebar_rezising = signal<boolean>(false)

  enabled_resizing(e: MouseEvent){
      this.extended_sidebar_rezising.set(true);
      this.click_position_init = e.x;
      this.sidebar_extended_size_init = this.sidebar_extended_size();
  
      this.movement_capture_function = (event: MouseEvent) => {
        const size = this.sidebar_extended_size_init - (this.click_position_init - event.x)/16;
        this.extended_sidebar_open.set(size > this.min_sidebar_extended_width)
        this.sidebar_extended_size.update( ()=> size < this.min_sidebar_extended_width ? 13 : size)
      }
  
      document.addEventListener('mousemove', this.movement_capture_function);
    }
  
    disable_resizing(){
      document.removeEventListener("mousemove", this.movement_capture_function);
    }
}
