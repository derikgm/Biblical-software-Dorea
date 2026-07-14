import { Component, input, output, } from '@angular/core';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { heroXMark } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'marker-component',
  imports: [NgIcon],
  templateUrl: './marker-component.html',
  styleUrl: './marker-component.css',
  providers:[
    provideIcons({
      cruz: heroXMark,
    })
  ]
})
export class MarkerComponent {
  yPosition = input<number>(0);
  xPosition = input<number>(0);
  colorMark = output<number>();
}
