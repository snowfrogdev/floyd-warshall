import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, Observable } from 'rxjs';
import { lines } from './floyd-warshall-algo';
import { FloydWarshallState, FloydWarshallStateDto } from './floyd-warshall.state';

@Injectable({
  providedIn: 'root',
})
export class FloydWarshallService {
  private historyIndex = 0;
  private history: FloydWarshallState[] = [];
  private _state = new BehaviorSubject<FloydWarshallState>(new FloydWarshallState([]));
  state$: Observable<FloydWarshallState> = this._state.asObservable();
  get state(): FloydWarshallState {
    return this._state.getValue();
  }

  private _progressValue = new BehaviorSubject<number>(0);
  progressValue$: Observable<number> = this._progressValue.asObservable();

  private _bufferValue = new BehaviorSubject<number>(0);
  bufferValue$: Observable<number> = this._bufferValue.asObservable();

  initialize(adjacencyMatrix: readonly (readonly number[])[]): void {
    this.historyIndex = 0;
    this.history = [];
    this._state.next(new FloydWarshallState(adjacencyMatrix));
    this.history.push(this.state);

    if (typeof Worker !== 'undefined') {
      // Create a new
      const worker = new Worker(new URL('./floyd-warshall.worker', import.meta.url));
      worker.postMessage(this.state);
      worker.onmessage = ({ data }: { data: FloydWarshallStateDto }) => {
        const state = FloydWarshallState.from(data);
        this.history.push(state);
        this.updateBufferValue();
        if (state.isDone) {
          console.log('done');
        }
      };
    } else {
      // Web Workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }
  }

  stepBackward() {
    this.historyIndex--;
    this.updateProgressValue();

    const stateFromHistory = this.history[this.historyIndex];
    if (stateFromHistory) {
      this._state.next(stateFromHistory);
    }
  }

  stepForward() {
    this.historyIndex++;
    this.updateProgressValue();

    const stateFromHistory = this.history[this.historyIndex];
    if (stateFromHistory) {
      this._state.next(stateFromHistory);
      return;
    }

    const instruction = lines.get(this.state.currentLine)!;
    const [newState = this.state, nextLine = this.state.currentLine + 1] = instruction(this.state);
    this._state.next(newState.setCurrentLine(nextLine));
    this.history.push(this.state);
  }

  reset() {
    this.historyIndex = 0;
    this.updateProgressValue();

    const stateFromHistory = this.history[0];
    this._state.next(stateFromHistory);
  }

  private updateBufferValue() {
    const totalTiles = this.state.adjacencyMatrix.length;
    const numberOfStatesEstimate =
      0.000642105 * totalTiles ** 4 +
      1.9431 * totalTiles ** 3 +
      11.0115 * totalTiles ** 2 -
      31.3267 * totalTiles +
      112.277;
    const bufferValue = Math.ceil((this.history.length / numberOfStatesEstimate) * 100);
    this._bufferValue.next(bufferValue);
  }

  private updateProgressValue() {
    const totalTiles = this.state.adjacencyMatrix.length;
    const numberOfStatesEstimate =
      0.000642105 * totalTiles ** 4 +
      1.9431 * totalTiles ** 3 +
      11.0115 * totalTiles ** 2 -
      31.3267 * totalTiles +
      112.277;
    const progressValue = (this.historyIndex / numberOfStatesEstimate) * 100;
    this._progressValue.next(progressValue);
  }
}
