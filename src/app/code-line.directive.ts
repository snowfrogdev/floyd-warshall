import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appCodeLine]',
})
export class CodeLineDirective {
  @Input() appCodeLine!: number;
  @Input() lineToHighlight?: number;

  constructor(private el: ElementRef) {}

  ngOnChanges() {
    if (this.appCodeLine === this.lineToHighlight) {
      this.el.nativeElement.style.backgroundColor = 'yellow';
    } else {
      this.el.nativeElement.style.backgroundColor = '';
    }
  }
}
