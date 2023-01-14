import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export type ControlsState = {
  readonly isResetDisabled: boolean;
  readonly isStepBackDisabled: boolean;
  readonly isPlayPauseDisabled: boolean;
  readonly isPlaying: boolean;
  readonly isStepForwardDisabled: boolean;
};

export type ControlsEvent = 'reset' | 'step-back' | 'play-pause' | 'step-forward' | number;

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ControlsComponent {
  @Output('emit') emitter = new EventEmitter<ControlsEvent>();
  @Input() state: ControlsState = {
    isResetDisabled: true,
    isStepBackDisabled: true,
    isPlayPauseDisabled: false,
    isPlaying: false,
    isStepForwardDisabled: false,
  };
  dragHandleActive = false;
  showSpeedControl = false;

  onResetClick() {
    this.emitter.emit('reset');
  }

  onStepBackClick() {
    this.emitter.emit('step-back');
  }

  onPlayPauseClick() {
    this.emitter.emit('play-pause');
  }

  onStepForwardClick() {
    this.emitter.emit('step-forward');
  }

  onSpeedChange(speed: number) {
    this.emitter.emit(speed);
  }

  makeSliderLabel(value: number): string {
    return `${value}%`;
  }
}
