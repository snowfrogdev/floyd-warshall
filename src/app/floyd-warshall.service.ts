import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, Observable } from 'rxjs';
import { MAX_CHECKPOINTS } from './constants';
import { lines } from './floyd-warshall-algo';
import { FloydWarshallState, FloydWarshallStateDto } from './floyd-warshall.state';
import { estimateNumberOfStates } from './utils';

@Injectable({
  providedIn: 'root',
})
export class FloydWarshallService {
  private checkpoints = new Map<number, FloydWarshallState>();
  private stateIndex = 0;
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
    this.estimatedNumberOfStates = estimateNumberOfStates(adjacencyMatrix);
    this.bufferSize = Math.max(1, Math.ceil(this.estimatedNumberOfStates / MAX_CHECKPOINTS));

    this.stateIndex = 0;
    this._state.next(new FloydWarshallState(adjacencyMatrix));
    this.checkpoints.set(0, this.state);

    if (typeof Worker !== 'undefined') {
      // Create a new
      const worker = new Worker(new URL('./floyd-warshall.worker', import.meta.url));
      worker.postMessage(this.state);
      worker.onmessage = ({ data }: { data: FloydWarshallStateDto }) => {
        const state = FloydWarshallState.from(data);
        this.checkpoints.set(data.index, state);
        //this.updateBufferValue();
      };
    } else {
      // Web Workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }
  }

  stepBackward() {
    this.stateIndex--;
    //this.updateProgressValue();
    if (this.buffer.length === 0) {
      this.seek(this.stateIndex);
      return;
    }

    this._state.next(this.buffer.pop()![1]);
  }

  stepForward() {
    this.buffer.push([this.stateIndex, this.state]);

    this.stateIndex++;
    //this.updateProgressValue();
    const instruction = lines.get(this.state.currentLine)!;
    const [newState = this.state, nextLine = this.state.currentLine + 1] = instruction(this.state);
    this._state.next(newState.setCurrentLine(nextLine));
    if (this.buffer.length > this.bufferSize) {
      this.buffer.shift();
    }
  }

  reset() {
    this.stateIndex = 0;
    //this.updateProgressValue();
    this.buffer = [];
    this._state.next(this.checkpoints.get(0)!);
  }

  /* private updateBufferValue() {
    const numberOfStatesEstimate = estimateNumberOfStates(this.state.adjacencyMatrix);
    const bufferValue = Math.ceil((this.buffer.length / numberOfStatesEstimate) * 100);
    this._bufferValue.next(bufferValue);
  }

  private updateProgressValue() {
    const numberOfStatesEstimate = estimateNumberOfStates(this.state.adjacencyMatrix);
    const progressValue = Math.ceil((this.historyIndex / numberOfStatesEstimate) * 100);
    this._progressValue.next(progressValue);
  }*/

  seek(stateIndex: number) {
    //this.updateProgressValue();

    const closest: [number, FloydWarshallState] = this.findClosestCheckPointBeforeOrAt(stateIndex);

    let index = closest![0];
    let state: FloydWarshallState = closest![1];

    while (!state.isDone && index <= stateIndex) {
      const instruction = lines.get(state.currentLine)!;
      const [newState = state, nextLine = state.currentLine + 1] = instruction(state);
      state = newState.setCurrentLine(nextLine);
      this.buffer.push([index, state]);
      index++;
    }

    this._state.next(this.buffer.pop()![1]);
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

  getStateIndexFrom(percentage: number) {
    return Math.min(Math.round((percentage / 100) * this.estimatedNumberOfStates), this.buffer.length - 1);
  }
}
