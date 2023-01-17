import { Directive, ElementRef, EventEmitter, Input, Output, Renderer2, ViewContainerRef } from '@angular/core';
import { DebuggerDotComponent } from './debugger-dot/debugger-dot.component';

@Directive({
  selector: '[appCodeLine]',
})
export class CodeLineDirective {
  @Input() appCodeLine!: number;
  @Input() lineToHighlight?: number;
  @Output() debuggerPoint = new EventEmitter<{ line: number; isSet: boolean }>();

  constructor(private el: ElementRef, private renderer: Renderer2, private viewContainerRef: ViewContainerRef) {}

  ngOnInit() {
    const line = this.el.nativeElement;
    this.renderer.setStyle(line, 'position', 'relative');
    const dot = this.viewContainerRef.createComponent(DebuggerDotComponent);
    this.renderer.appendChild(line, dot.location.nativeElement);
    dot.instance.debuggerPoint.subscribe((isSet: boolean) => {
      this.debuggerPoint.emit({ line: this.appCodeLine, isSet });
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
