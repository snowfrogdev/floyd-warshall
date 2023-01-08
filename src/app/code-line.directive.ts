import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appCodeLine]',
})
export class CodeLineDirective {
  @Input() appCodeLine!: number;
  @Input() lineToHighlight?: number;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    const line = this.el.nativeElement;
    this.renderer.setStyle(line, 'position', 'relative');
    const dotContainer = this.renderer.createElement('div');
    this.renderer.addClass(dotContainer, 'breakpoint-dot-container');
    this.renderer.setStyle(dotContainer, 'position', 'absolute');
    this.renderer.setStyle(dotContainer, 'left', '-2.5rem');
    this.renderer.setStyle(dotContainer, 'top', '-1px');
    this.renderer.setStyle(dotContainer, 'cursor', 'pointer');
    this.renderer.setStyle(dotContainer, 'position', 'absolute');
    this.renderer.setStyle(dotContainer, 'width', '3rem');
    this.renderer.setStyle(dotContainer, 'height', '1rem');
    this.renderer.setStyle(dotContainer, 'display', 'flex');
    this.renderer.setStyle(dotContainer, 'align-items', 'center');
    this.renderer.setStyle(dotContainer, 'justify-content', 'center');
    const dot = this.renderer.createElement('div');
    this.renderer.addClass(dot, 'breakpoint-dot');
    this.renderer.setStyle(dot, 'background-color', 'red');
    this.renderer.setStyle(dot, 'opacity', '0');
    this.renderer.setStyle(dot, 'border-radius', '50%');
    this.renderer.setStyle(dot, 'height', '0.5rem');
    this.renderer.setStyle(dot, 'width', '0.5rem');

    this.renderer.appendChild(line, dotContainer);
    this.renderer.appendChild(dotContainer, dot);

    this.renderer.listen(dotContainer, 'mouseenter', () => {
      this.renderer.setStyle(dot, 'opacity', '100');
    });
    this.renderer.listen(dotContainer, 'mouseleave', () => {
      this.renderer.setStyle(dot, 'opacity', '0');
    });
  }

  ngOnChanges() {
    if (this.appCodeLine === this.lineToHighlight) {
      this.el.nativeElement.style.backgroundColor = 'yellow';
    } else {
      this.el.nativeElement.style.backgroundColor = '';
    }
  }
}
