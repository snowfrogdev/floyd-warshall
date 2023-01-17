import { Injectable } from '@angular/core';
import { AppComponent } from './app.component';
import { ControlsEvent } from './controls/controls.component';
import { StateTransition } from './state-machine.service';

@Injectable({
  providedIn: 'root',
})
export class RulesEngineService {
  private rules: Rule[] = [
    {
      condition: (input: unknown, context: AppComponent) => (<StateTransition>input).to === 'start',
      action: (input: unknown, context: AppComponent) => {
        context.controlsState = {
          isResetDisabled: true,
          isStepBackDisabled: true,
          isPlayPauseDisabled: false,
          isPlaying: false,
          isStepForwardDisabled: false,
        };

        for (const tooltip of context.tooltips) {
          tooltip.disabled = true;
        }
      },
    },
    {
      condition: (input: unknown, context: AppComponent) => (<StateTransition>input).to === 'running',
      action: (input: unknown, context: AppComponent) => {
        context.controlsState = {
          isResetDisabled: false,
          isStepBackDisabled: true,
          isPlayPauseDisabled: false,
          isPlaying: true,
          isStepForwardDisabled: true,
        };

        const asyncLoop = () => {
          if (
            context.stateMachine.currentState === 'start' ||
            context.stateMachine.currentState === 'paused' ||
            context.stateMachine.currentState === 'end'
          ) {
            return;
          }

          context.floydWarshallService.stepForward();
          context.cdr.markForCheck();

          if (context.breakpoints.has(context.lineToHighlight!)) {
            context.stateMachine.transitionTo('paused');
            return;
          }

          setTimeout(asyncLoop, 500 - (context.speed / 100) * 500);
        };
        asyncLoop();
      },
    },
    {
      condition: (input: unknown, context: AppComponent) => (<StateTransition>input).to === 'paused',
      action: (input: unknown, context: AppComponent) => {
        context.controlsState = {
          isResetDisabled: false,
          isStepBackDisabled: false,
          isPlayPauseDisabled: false,
          isPlaying: false,
          isStepForwardDisabled: false,
        };
      },
    },
    {
      condition: (input: unknown, context: AppComponent) => (<StateTransition>input).to === 'end',
      action: (input: unknown, context: AppComponent) => {
        context.controlsState = {
          isResetDisabled: false,
          isStepBackDisabled: false,
          isPlayPauseDisabled: true,
          isPlaying: false,
          isStepForwardDisabled: true,
        };
      },
    },
    {
      condition: (input: unknown, context: AppComponent) => (<StateTransition>input).to === 'seeking',
      action: (input: unknown, context: AppComponent) => {
        context.controlsState = {
          isResetDisabled: true,
          isStepBackDisabled: true,
          isPlayPauseDisabled: true,
          isPlaying: false,
          isStepForwardDisabled: true,
        };
      },
    },
    {
      condition: (input: unknown, context: AppComponent) => (<StateTransition>input).from === 'start',
      action: (input: unknown, context: AppComponent) => {
        for (const tooltip of context.tooltips) {
          tooltip.disabled = false;
        }
      },
    },
    {
      condition: (input: unknown, context: AppComponent) => <ControlsEvent>input === 'reset',
      action: (input: unknown, context: AppComponent) => {
        context.floydWarshallService.reset();
        context.stateMachine.transitionTo('start');
      },
    },
    {
      condition: (input: unknown, context: AppComponent) => <ControlsEvent>input === 'step-back',
      action: (input: unknown, context: AppComponent) => {
        if (context.floydWarshallService.state.currentLine === 2) {
          context.floydWarshallService.stepBackward();
          context.stateMachine.transitionTo('start');
          return;
        }

        if (context.stateMachine.currentState === 'end') {
          context.floydWarshallService.stepBackward();
          context.stateMachine.transitionTo('paused');
          return;
        }

        context.floydWarshallService.stepBackward();
      },
    },
    {
      condition: (input: unknown, context: AppComponent) => <ControlsEvent>input === 'play-pause',
      action: (input: unknown, context: AppComponent) => {
        if (context.stateMachine.currentState === 'paused' || context.stateMachine.currentState === 'start') {
          context.stateMachine.transitionTo('running');
        } else {
          context.stateMachine.transitionTo('paused');
        }
      },
    },
    {
      condition: (input: unknown, context: AppComponent) => <ControlsEvent>input === 'step-forward',
      action: (input: unknown, context: AppComponent) => {
        if (context.stateMachine.currentState === 'start') {
          context.stateMachine.transitionTo('paused');
        }
        context.floydWarshallService.stepForward();
      },
    },
    {
      condition: (input: unknown, context: AppComponent) => typeof input === 'number',
      action: (input: unknown, context: AppComponent) => {
        context.speed = <number>input;
      },
    },
  ];

  execute(input: StateTransition | ControlsEvent, context: AppComponent) {
    this.rules.forEach((rule) => {
      if (rule.condition(input, context)) {
        rule.action(input, context);
      }
    });
  }
}

interface Rule {
  condition: (input: unknown, context: AppComponent) => boolean;
  action: (input: unknown, context: AppComponent) => void;
}
