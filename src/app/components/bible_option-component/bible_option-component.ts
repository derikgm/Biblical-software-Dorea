import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject, input, signal, ViewChild } from '@angular/core';
import { NgIcon, provideIcons } from "@ng-icons/core";
import { heroBars3, heroBars3CenterLeft, heroEquals, heroPause } from '@ng-icons/heroicons/outline';
import { FontSettingsServices } from '../../services/font_settings-services';

@Component({
  selector: 'bible-option-component',
  imports: [NgIcon],
  providers: [
    provideIcons({
      row: heroBars3,
      lineal: heroBars3CenterLeft,
      right: heroEquals,
      top: heroPause,
    })
  ],
  template: `
    <div #container class="container">
        <div class="option-group">
            <a href="#" class="option" #lineal_anchor (click)="change_bible_form(true)">
                <ng-icon name="lineal" />
            </a>
            <a href="#" class="option" #row_anchor (click)="change_bible_form(false)">
                <ng-icon name="row"/>
            </a>
        </div>

        <div class="option-group">
            <a href="#" class="option" 
            (click)="change_option_bar_position()">
                <ng-icon [name]="option_bar_in_top() ? 'top' : 'right'"/>
            </a>
        </div>
        
    </div>
        
    <style>
      :host{
        @apply sticky top-0 z-50;
      }

      .container {
          @apply w-full bg-transparent sticky right-0 top-0 flex z-50 m-0 py-1 text-xl;
      }

      .container:hover{
        .option-group {
            @apply bg-gray-200 border-gray-700 text-black shadow-md
            dark:bg-gray-700 dark:text-white dark:border-gray-500;

            .selected {
            @apply text-blue-500 bg-white 
            dark:bg-gray-200 dark:text-blue-400;
            }
        }
    }

    .option-in-right {
          @apply h-screen mb-2 justify-center items-center align-middle flex flex-col
          space-y-1 space-x-0;

          .option-group {
              @apply space-x-0;
          }
      }
      .option-in-top {
          @apply space-x-1 flex flex-row;
      }

      .option-group {
          @apply px-1 py-0.5 rounded space-x-1 border 
          bg-gray-200/10 border-gray-700/10 text-black/10;
      }

      .option {
          @apply rounded px-1.5;
      }

      .selected {
          @apply text-blue-500/5 bg-white/5 cursor-default;
      }

    </style>
  `,
})
export class BibleOptionComponent implements AfterViewInit{
  @ViewChild('container') container!: ElementRef<HTMLDivElement>;
  @ViewChild("lineal_anchor") lineal_anchor!: ElementRef<HTMLAnchorElement>;
  @ViewChild("row_anchor") row_anchor!: ElementRef<HTMLAnchorElement>;

  text_option = input<HTMLDivElement>();
  option_bar_in_top = signal<boolean>(false);

  font_settings_services = inject(FontSettingsServices);

  ngAfterViewInit(): void {
    this.change_option_bar_position();
    this.paint_bible_form_option(this.font_settings_services.is_inline());
  }

  change_option_bar_position() {
    const parentElement = this.text_option();
    
    if (!parentElement) {
      return;
    }

    if (this.option_bar_in_top()) {
      parentElement.classList.remove('flex-col');
      parentElement.classList.add('flex-row-reverse');
      this.container.nativeElement.classList.remove('option-in-top');
      this.container.nativeElement.classList.add('option-in-right');
    } else {
      parentElement.classList.remove('flex-row-reverse');
      parentElement.classList.add('flex-col');
      this.container.nativeElement.classList.remove('option-in-right');
      this.container.nativeElement.classList.add('option-in-top');
    }

    this.option_bar_in_top.update(v => !v);
  }

  change_bible_form(is_inline: boolean){
    this.font_settings_services.change_bible_form(is_inline);
    this.paint_bible_form_option(is_inline);
  }

  private paint_bible_form_option(is_inline: boolean){
    if(is_inline){
      this.lineal_anchor.nativeElement.classList.add('selected')
      this.row_anchor.nativeElement.classList.remove('selected')
    } else {
      this.lineal_anchor.nativeElement.classList.remove('selected')
      this.row_anchor.nativeElement.classList.add('selected')
    }
  }
}
