// focus-on-create.directive.ts
import { Directive, ElementRef, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appFocusOnCreate]'
})
export class FocusOnCreateDirective implements AfterViewInit {
  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    setTimeout(() => {
        this.el.nativeElement.focus();
    }, 0);
  }
}