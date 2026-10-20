import { Component, output } from '@angular/core';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { heroXMark } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-marker',
  imports: [NgIcon],
  templateUrl: './marker-component.html',
  styleUrl: './marker-component.css',
  providers: [
    provideIcons({
      cruz: heroXMark,
    }),
  ],
})
export class MarkerComponent {
  colorMark = output<number>();
}
