import { AfterViewInit, Component, computed, ElementRef, input, output, signal, ViewChild, } from '@angular/core';
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
  @ViewChild("menu_container") menu_container!: ElementRef<HTMLDivElement> 


  colorMark = output<number>();




}
