import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MAX_CHECKPOINTS } from './constants';
import { lines } from './floyd-warshall-algo';
import {
  getCurrentLine,
  getCurrentStep,
  getIsDone,
  make,
  setCurrentLine,
  setCurrentStep,
  stateSizeInBytes,
} from './floyd-warshall-encoded-state-helpers';
import { InitialDto } from './initial-dto';
import { estimateNumberOfStates } from './utils';

@Injectable({
  providedIn: 'root',
})
export class FloydWarshallService {
  private checkpoints = new Map<number, DataView>();
  private buffer: DataView[] = [];
  private _state = new BehaviorSubject<DataView>(new DataView(new ArrayBuffer(0)));
  state$: Observable<DataView> = this._state.asObservable();
  get state(): DataView {
    return this._state.getValue();
  }
  private adjacencyMatrix: readonly (readonly number[])[] = [];

  private _progressValue = new BehaviorSubject<number>(0);
  progressValue$: Observable<number> = this._progressValue.asObservable();

  private _bufferValue = new BehaviorSubject<number>(0);
  bufferValue$: Observable<number> = this._bufferValue.asObservable();

  private estimatedNumberOfStates = 0;
  private bufferSize = 0;

  initialize(adjacencyMatrix: readonly (readonly number[])[]): void {
    this.adjacencyMatrix = adjacencyMatrix;
    this.estimatedNumberOfStates = estimateNumberOfStates(adjacencyMatrix.length);
    console.log(stateSizeInBytes(adjacencyMatrix.length));
    this.bufferSize = Math.max(1, Math.ceil(this.estimatedNumberOfStates / MAX_CHECKPOINTS));

    this._state.next(make(adjacencyMatrix));
    this.checkpoints.set(0, this.state);

    if (typeof Worker !== 'undefined') {
      const worker = new Worker(new URL('./floyd-warshall.worker', import.meta.url));
      const initialDto: InitialDto = { adjacencyMatrix, state: this.state.buffer };
      worker.postMessage(initialDto);
      worker.onmessage = ({ data }: { data: ArrayBuffer }) => {
        const state = new DataView(data);
        const currentStep = getCurrentStep(state);
        this.checkpoints.set(currentStep, state);
        const bufferValue = Math.ceil((currentStep / this.estimatedNumberOfStates) * 100);
        this._bufferValue.next(bufferValue);

        if (getIsDone(state)) {
          this._bufferValue.next(100);
          this.estimatedNumberOfStates = currentStep;
        }
      };
    }
  }

  stepBackward() {
    if (this.buffer.length === 0) {
      this.seek(getCurrentStep(this.state) - 1);
      return;
    }

    const state = this.buffer.pop()!;
    this._state.next(state);
    this.updateProgressValue();
  }

  stepForward() {
    this.buffer.push(this.state);

    const currentLine = getCurrentLine(this.state);
    const instruction = lines.get(currentLine)!;
    const nextLine: number = instruction(this.state, this.adjacencyMatrix) ?? currentLine + 1;

    const newState = new DataView(this.state.buffer.slice(0));
    setCurrentLine(nextLine, newState);
    const step = getCurrentStep(newState) + 1;
    setCurrentStep(step, newState);

    this._state.next(newState);
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

    let state: DataView = this.findClosestCheckPointBeforeOrAt(stateIndex);

    if (getCurrentStep(state) === stateIndex) {
      this._state.next(state);
      this.updateProgressValue();
      return;
    }

    while (!getIsDone(state) && getCurrentStep(state) <= stateIndex) {
      this.buffer.push(state);
      const currentLine = getCurrentLine(state);
      const instruction = lines.get(currentLine)!;
      const nextLine: number = instruction(state, this.adjacencyMatrix) ?? currentLine + 1;

      state = new DataView(state.buffer.slice(0));
      setCurrentLine(nextLine, state);
      const step = getCurrentStep(state) + 1;
      setCurrentStep(step, state);
    }

    this._state.next(this.buffer.pop()!);
    this.updateProgressValue();
  }

  private findClosestCheckPointBeforeOrAt(stateIndex: number): DataView {
    if (this.checkpoints.has(stateIndex)) {
      return this.checkpoints.get(stateIndex)!;
    }

    let closest: [number, DataView];
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
    return closest![1];
  }

  private updateProgressValue() {
    const progressValue = Math.ceil((getCurrentStep(this.state) / this.estimatedNumberOfStates) * 100);
    this._progressValue.next(progressValue);
  }

  getStateIndexFrom(percentage: number) {
    return Math.round((percentage / 100) * (this.estimatedNumberOfStates - 1));
  }
}
