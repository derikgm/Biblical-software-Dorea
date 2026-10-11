import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SidebarSettingsServices {
  min_sidebar_extended_width = 8;
  click_position_init = 0;
  sidebar_extended_size_init = 0;
  movement_capture_function: (e: MouseEvent) => void = () => {};

  /** Indica si el panel lateral extendido está abierto (se alterna al pulsar su ancla). */
  extended_sidebar_open = signal<boolean>(false);
  sidebar_extended_size = signal<number>(13);
  enabled_extended_sidebar_rezising = signal<boolean>(false);

  current_path = signal<CurrentPath>(CurrentPath.BIBLE);

  enabled_resizing(e: MouseEvent) {
    this.enabled_extended_sidebar_rezising.set(true);
    this.click_position_init = e.x;
    this.sidebar_extended_size_init = this.sidebar_extended_size();

    this.movement_capture_function = (event: MouseEvent) => {
      const size = this.sidebar_extended_size_init - (this.click_position_init - event.x) / 16;
      this.extended_sidebar_open.set(size > this.min_sidebar_extended_width);
      this.sidebar_extended_size.update(() => (size < this.min_sidebar_extended_width ? 13 : size));
    };

    const stop = () => {
      this.disable_resizing();
      document.removeEventListener('mouseup', stop);
    };

    document.addEventListener('mousemove', this.movement_capture_function);
    document.addEventListener('mouseup', stop);
  }

  disable_resizing() {
    this.enabled_extended_sidebar_rezising.set(false);
    document.removeEventListener('mousemove', this.movement_capture_function);
  }

  anchor_handler(anchor: number) {
    if (anchor == this.current_path()) this.extended_sidebar_open.update((v) => !v);

    if (anchor == -1) this.extended_sidebar_open.set(false);

    this.current_path.set(anchor);
  }
}

export enum CurrentPath {
  BIBLE,
  NOTES,
}
