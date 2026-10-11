// visible.directive.ts
import {
  Directive,
  ElementRef,
  EventEmitter,
  Output,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';

@Directive({
  selector: '[elementVisible]',
})
export class VisibleDirective implements OnInit, OnDestroy {
  @Output() visible = new EventEmitter<HTMLElement>();
  @Output() notVisible = new EventEmitter<HTMLElement>();

  private observer: IntersectionObserver | null = null;
  private el = inject(ElementRef);

  ngOnInit() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.visible.emit(this.el.nativeElement);
          } else {
            this.notVisible.emit(this.el.nativeElement);
          }
        });
      },
      {
        threshold: 0,
        rootMargin: '0px',
      },
    );

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}
