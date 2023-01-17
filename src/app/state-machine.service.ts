import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type AppState = 'start' | 'running' | 'paused' | 'end' | 'seeking';

export interface StateTransition {
  from: AppState;
  to: AppState;
}

const allowedTransitions: StateTransition[] = [
  { from: 'start', to: 'start' },
  { from: 'start', to: 'running' },
  { from: 'start', to: 'paused' },
  { from: 'start', to: 'seeking' },
  { from: 'running', to: 'running' },
  { from: 'running', to: 'start' },
  { from: 'running', to: 'paused' },
  { from: 'running', to: 'end' },
  { from: 'running', to: 'seeking' },
  { from: 'paused', to: 'paused' },
  { from: 'paused', to: 'start' },
  { from: 'paused', to: 'running' },
  { from: 'paused', to: 'end' },
  { from: 'paused', to: 'seeking' },
  { from: 'end', to: 'end' },
  { from: 'end', to: 'start' },
  { from: 'end', to: 'paused' },
  { from: 'end', to: 'seeking' },
  { from: 'seeking', to: 'seeking' },
  { from: 'seeking', to: 'start' },
  { from: 'seeking', to: 'running' },
  { from: 'seeking', to: 'paused' },
  { from: 'seeking', to: 'end' },
];

@Injectable({
  providedIn: 'root',
})
export class StateMachineService {
  private _currentState: AppState = 'start';
  get currentState(): AppState {
    return this._currentState;
  }

  private _transition = new Subject<StateTransition>();
  readonly transition = this._transition.asObservable();

  constructor() {}

  canTransitionTo(state: AppState): boolean {
    return allowedTransitions.some((transition) => transition.from === this._currentState && transition.to === state);
  }

  transitionTo(state: AppState): void {
    if (!this.canTransitionTo(state)) {
      throw new Error(`Cannot transition from ${this._currentState} to ${state}`);
    }
    const transition = { from: this._currentState, to: state };
    this._currentState = state;
    this._transition.next(transition);
  }
}
