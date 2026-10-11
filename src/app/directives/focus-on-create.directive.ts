// focus-on-create.directive.ts
import { Directive, ElementRef, AfterViewInit, inject } from '@angular/core';

@Directive({
  selector: '[appFocusOnCreate]',
})
export class FocusOnCreateDirective implements AfterViewInit {
  private el = inject(ElementRef);

  ngAfterViewInit() {
    setTimeout(() => {
      this.el.nativeElement.focus();
    }, 0);
  }
}
