import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Output, HostBinding } from '@angular/core';

@Component({
  template: '<div class="dot"></div>',
  styleUrls: ['./debugger-dot.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DebuggerDotComponent {
  @Output() debuggerPoint = new EventEmitter<boolean>();
  @HostBinding('style.opacity') opacity = 0;
  isSet = false;

  @HostListener('click') onClick() {
    this.isSet = !this.isSet;
    this.opacity = 1;
    this.debuggerPoint.emit(this.isSet);
  }

  @HostListener('mouseenter') onMouseEnter() {
    if (this.isSet) return;
    this.opacity = 0.5;
  }

  @HostListener('mouseleave') onMouseLeave() {
    if (this.isSet) return;
    this.opacity = 0;
  }
}
