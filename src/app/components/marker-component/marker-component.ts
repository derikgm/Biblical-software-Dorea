import { AfterViewInit, Component, ElementRef, input, output, signal, ViewChild, } from '@angular/core';
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
export class MarkerComponent implements AfterViewInit{
  @ViewChild("menu_container") menu_container!: ElementRef<HTMLDivElement> 

  y_position_input = input<number>(0);
  x_position_input = input<number>(0);
  colorMark = output<number>();

  y_position = signal(0);
  x_position = signal(0);

  ngAfterViewInit(): void {
    const width = this.menu_container.nativeElement.getBoundingClientRect().width;
    const height = this.menu_container.nativeElement.getBoundingClientRect().height;
    const father_width = this.menu_container.nativeElement.parentElement?.parentElement?.getBoundingClientRect().width ?? 0

    const excedent_right = father_width - ((width/2) + this.x_position_input());
    const excedent_left = this.x_position_input() - (width/2);

    let x_pos = this.x_position_input() - (width/2);

    if(excedent_right < 0) x_pos = x_pos + excedent_right
    if(excedent_left < 0) x_pos = x_pos - excedent_left

    this.y_position.set(this.y_position_input() - height - 12)
    this.x_position.set(x_pos)
  }

}
