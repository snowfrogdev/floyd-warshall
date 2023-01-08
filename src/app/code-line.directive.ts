import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appCodeLine]',
})
export class CodeLineDirective {
  @Input() appCodeLine!: number;
  @Input() lineToHighlight?: number;

  private dot!: HTMLElement;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    const line = this.el.nativeElement;
    this.renderer.setStyle(line, 'position', 'relative');
    const dot = this.renderer.createElement('div');
    this.renderer.addClass(dot, 'breakpoint-dot');
    this.renderer.setStyle(dot, 'background-color', 'red');
    this.renderer.setStyle(dot, 'border-radius', '50%');
    this.renderer.setStyle(dot, 'height', '0.5rem');
    this.renderer.setStyle(dot, 'width', '0.5rem');
    this.renderer.setStyle(dot, 'position', 'absolute');
    this.renderer.setStyle(dot, 'left', '-15px');
    this.renderer.setStyle(dot, 'top', '4px');
    this.renderer.setStyle(dot, 'display', 'none');
    this.dot = dot;
    this.renderer.appendChild(line, dot);
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.renderer.setStyle(this.dot, 'display', 'block');
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.renderer.setStyle(this.dot, 'display', 'none');
  }

  ngOnChanges() {
    if (this.appCodeLine === this.lineToHighlight) {
      this.el.nativeElement.style.backgroundColor = 'yellow';
    } else {
      this.el.nativeElement.style.backgroundColor = '';
    }
  }
}
