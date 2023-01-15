import { Injectable } from '@angular/core';
import { BehaviorSubject, filter } from 'rxjs';
import { lines } from './floyd-warshall-algo';
import { FloydWarshallState, FloydWarshallStateDto } from './floyd-warshall.state';

@Injectable({
  providedIn: 'root',
})
export class FloydWarshallService {
  private historyIndex = 0;
  private history: FloydWarshallState[] = [];
  private shouldEmit = true;
  private _state = new BehaviorSubject<FloydWarshallState>(new FloydWarshallState([]));
  state$ = this._state.pipe(filter(() => this.shouldEmit));
  get state(): FloydWarshallState {
    return this._state.getValue();
  }

  initialize(adjacencyMatrix: readonly (readonly number[])[]): void {
    this.historyIndex = 0;
    this.history = [];
    this._state.next(new FloydWarshallState(adjacencyMatrix));
    this.history.push(this.state);

    if (typeof Worker !== 'undefined') {
      // Create a new
      const worker = new Worker(new URL('./floyd-warshall.worker', import.meta.url));
      worker.postMessage(this.state);
      worker.onmessage = ({ data }: {data: FloydWarshallStateDto}) => {
        const state = FloydWarshallState.from(data);
        this.history.push(state);
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
    const stateFromHistory = this.history[this.historyIndex];
    if (stateFromHistory) {
      this._state.next(stateFromHistory);
    }
  }

  stepForward() {
    this.historyIndex++;
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
    const stateFromHistory = this.history[0];
    this._state.next(stateFromHistory);
  }
}
