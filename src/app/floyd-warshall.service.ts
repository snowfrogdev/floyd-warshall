import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, Observable } from 'rxjs';
import { MAX_CHECKPOINTS } from './constants';
import { lines } from './floyd-warshall-algo';
import { getCurrentLine, getCurrentStep, setCurrentLine, setCurrentStep } from './floyd-warshall-encoded-state-helpers';
import { FloydWarshallState } from './floyd-warshall-state';
import { InitialDto } from './initial-dto';
//import { InitialDto } from './floyd-warshall.worker';
import { estimateNumberOfStates } from './utils';

@Injectable({
  providedIn: 'root',
})
export class FloydWarshallService {
  private checkpoints = new Map<number, FloydWarshallState>();
  private buffer: [number, FloydWarshallState][] = [];
  private _state = new BehaviorSubject<FloydWarshallState>(new FloydWarshallState([]));
  state$: Observable<FloydWarshallState> = this._state.asObservable();
  get state(): FloydWarshallState {
    return this._state.getValue();
  }

  private _progressValue = new BehaviorSubject<number>(0);
  progressValue$: Observable<number> = this._progressValue.asObservable();

  private _bufferValue = new BehaviorSubject<number>(0);
  bufferValue$: Observable<number> = this._bufferValue.asObservable();

  private estimatedNumberOfStates = 0;
  private bufferSize = 0;

  initialize(adjacencyMatrix: readonly (readonly number[])[]): void {
    this.estimatedNumberOfStates = estimateNumberOfStates(adjacencyMatrix.length);
    this.bufferSize = Math.max(1, Math.ceil(this.estimatedNumberOfStates / MAX_CHECKPOINTS));

    this._state.next(new FloydWarshallState(adjacencyMatrix));
    this.checkpoints.set(0, this.state);

    if (typeof Worker !== 'undefined') {
      const worker = new Worker(new URL('./floyd-warshall.worker', import.meta.url));
      const initialDto: InitialDto = { adjacencyMatrix, state: this.state.toBuffer() };
      worker.postMessage(initialDto);
      worker.onmessage = ({ data }: { data: ArrayBuffer }) => {
        const state = FloydWarshallState.from(data, adjacencyMatrix);
        this.checkpoints.set(state.currentStep, state);
        const bufferValue = Math.ceil((state.currentStep / this.estimatedNumberOfStates) * 100);
        this._bufferValue.next(bufferValue);

        if (state.isDone) {
          this._bufferValue.next(100);
          this.estimatedNumberOfStates = state.currentStep;
        }
      };
    }
  }

  stepBackward() {
    if (this.buffer.length === 0) {
      this.seek(this.state.currentStep - 1);
      return;
    }

    this._state.next(this.buffer.pop()![1]);
    this.updateProgressValue();
  }

  stepForward() {
    this.buffer.push([this.state.currentStep, this.state]);

    const state = new DataView(this.state.toBuffer());
    const currentLine = getCurrentLine(state);
    const instruction = lines.get(currentLine)!;
    const nextLine: number = instruction(state, this.state.adjacencyMatrix) ?? currentLine + 1;
    setCurrentLine(nextLine, state);
    const step = getCurrentStep(state) + 1;
    setCurrentStep(step, state);
    const newState = FloydWarshallState.from(state.buffer, this.state.adjacencyMatrix);

    this._state.next(newState.setCurrentLine(nextLine));
    if (this.buffer.length > this.bufferSize) {
      this.buffer.shift();
    }
    this.updateProgressValue();
  }

  reset() {
    this.buffer = [];
    this._state.next(this.checkpoints.get(0)!);
    this.updateProgressValue();
  }

  seek(stateIndex: number) {
    this.buffer = [];
    const closest: [number, FloydWarshallState] = this.findClosestCheckPointBeforeOrAt(stateIndex);

    let state: FloydWarshallState = closest![1];

    if (state.currentStep === stateIndex) {
      this._state.next(state);
      this.updateProgressValue();
      return;
    }

    while (!state.isDone && state.currentStep <= stateIndex) {
      this.buffer.push([state.currentStep, state]);
      const bufferState = new DataView(this.state.toBuffer());
      const currentLine = getCurrentLine(bufferState);
      const instruction = lines.get(currentLine)!;
      const nextLine: number = instruction(bufferState, this.state.adjacencyMatrix) ?? currentLine + 1;
      setCurrentLine(nextLine, bufferState);
      const step = getCurrentStep(bufferState) + 1;
      setCurrentStep(step, bufferState);
      state = FloydWarshallState.from(bufferState.buffer, this.state.adjacencyMatrix);
    }

    this._state.next(this.buffer.pop()![1]);
    this.updateProgressValue();
  }

  private findClosestCheckPointBeforeOrAt(stateIndex: number): [number, FloydWarshallState] {
    if (this.checkpoints.has(stateIndex)) {
      return [stateIndex, this.checkpoints.get(stateIndex)!];
    }

    let closest: [number, FloydWarshallState];
    let closestDiff = Infinity;
    for (const [index, state] of this.checkpoints) {
      if (index > stateIndex) {
        continue;
      }
      const diff = Math.abs(index - stateIndex);
      if (diff < closestDiff) {
        closest = [index, state];
        closestDiff = diff;
      }
    }
    return closest!;
  }

  private updateProgressValue() {
    const progressValue = Math.ceil((this.state.currentStep / this.estimatedNumberOfStates) * 100);
    this._progressValue.next(progressValue);
  }

  getStateIndexFrom(percentage: number) {
    return Math.round((percentage / 100) * (this.estimatedNumberOfStates - 1));
  }
}
