import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FloydWarshallState } from './floyd-warshall.state';
import { cloneMatrix } from './utils';

@Injectable({
  providedIn: 'root',
})
export class FloydWarshallService {
  private historyIndex = 0;
  private history: FloydWarshallState[] = [];
  private _state = new BehaviorSubject<FloydWarshallState>(new FloydWarshallState([]));
  state$ = this._state.asObservable();
  get state(): FloydWarshallState {
    return this._state.getValue();
  }

  initialize(adjacencyMatrix: readonly (readonly number[])[]): void {
    this.historyIndex = 0;
    this.history = [];
    this._state.next(new FloydWarshallState(adjacencyMatrix));
    this.history.push(this.state);
  }

  /**
   * Each line of the algorithm is represented by a function that is executed when the line is reached.
   *
   */
  private lines = new Map<number, () => [FloydWarshallState?, number?]>([
    [1, () => []],
    [2, () => [this.state.set_dist(cloneMatrix(this.state.adjacencyMatrix))]],
    [3, () => [this.state.set_next(Array.from({ length: this.state.V }, () => Array(this.state.V).fill(null)))]],
    [
      4,
      () => {
        let newState = this.state.set_u(this.state.u === undefined ? 0 : this.state.u + 1);
        if (newState.u! >= newState.V) {
          newState = newState.set_u(undefined);
          return [newState, 15];
        }
        return [newState];
      },
    ],
    [
      5,
      () => {
        let newState = this.state.set_v(this.state.v === undefined ? 0 : this.state.v + 1);
        if (newState.v! >= newState.V) {
          newState = newState.set_v(undefined);
          return [newState, 4];
        }
        return [newState];
      },
    ],
    [
      6,
      () => {
        if (this.state.u === this.state.v) {
          return [];
        }
        return [, 9];
      },
    ],
    [7, () => [this.state.update_dist(this.state.v!, this.state.v!, 0)]],
    [8, () => [this.state.update_next(this.state.v!, this.state.v!, this.state.v!), 5]],
    [
      9,
      () => {
        if (this.state.adjacencyMatrix[this.state.u!][this.state.v!] !== 0) {
          return [];
        }
        return [, 12];
      },
    ],
    [10, () => [this.state.update_next(this.state.u!, this.state.v!, this.state.v!), 5]],
    [12, () => [this.state.update_dist(this.state.u!, this.state.v!, Infinity)]],
    [13, () => [this.state.update_next(this.state.u!, this.state.v!, null), 5]],
    [
      15,
      () => {
        let newState = this.state.set_k(this.state.k === undefined ? 0 : this.state.k + 1);
        if (newState.k! >= newState.V) {
          newState = newState.set_k(undefined);
          return [newState, 22];
        }
        return [newState];
      },
    ],
    [
      16,
      () => {
        let newState = this.state.set_i(this.state.i === undefined ? 0 : this.state.i + 1);
        if (newState.i! >= newState.V) {
          newState = newState.set_i(undefined);
          return [newState, 15];
        }
        return [newState];
      },
    ],
    [
      17,
      () => {
        let newState = this.state.set_j(this.state.j === undefined ? 0 : this.state.j + 1);
        if (newState.j! >= newState.V) {
          newState = newState.set_j(undefined);
          return [newState, 16];
        }
        return [newState];
      },
    ],
    [
      18,
      () => {
        if (
          this.state.dist![this.state.i!][this.state.j!] >
          this.state.dist![this.state.i!][this.state.k!] + this.state.dist![this.state.k!][this.state.j!]
        ) {
          return [];
        }
        return [, 17];
      },
    ],
    [
      19,
      () => [
        this.state.update_dist(
          this.state.i!,
          this.state.j!,
          this.state.dist![this.state.i!][this.state.k!] + this.state.dist![this.state.k!][this.state.j!]
        ),
      ],
    ],
    [
      20,
      () => [this.state.update_next(this.state.i!, this.state.j!, this.state.next![this.state.i!][this.state.k!]), 17],
    ],
    [22, () => [this.state.setIsDone(true)]],
  ]);

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

    const instruction = this.lines.get(this.state.currentLine)!;
    const [newState = this.state, nextLine = this.state.currentLine + 1] = instruction();
    this._state.next(newState.setCurrentLine(nextLine));
    this.history.push(this.state);
  }

  reset() {
    this.historyIndex = 0;
    const stateFromHistory = this.history[0];
    this._state.next(stateFromHistory);
  }
}
