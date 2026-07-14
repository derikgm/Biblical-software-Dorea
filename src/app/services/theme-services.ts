import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeServices {
  theme = signal<boolean>(false);

  changeTheme(){
    const html = document.documentElement;

    if(this.theme())
      html.classList.remove('dark')
    else 
      html.classList.add('dark')
    
    this.theme.set(!this.theme());
  }


}
