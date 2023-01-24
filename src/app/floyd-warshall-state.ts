import {
  getCurrentLine,
  getCurrentStep,
  getDist,
  getIsDone,
  getNext,
  getV,
  get_i,
  get_j,
  get_k,
  get_u,
  get_v,
  make,
  setCurrentLine,
  setCurrentStep,
  setDist,
  setIsDone,
  setNext,
  setV,
  set_i,
  set_j,
  set_k,
  set_u,
  set_v,
} from './floyd-warshall-encoded-state-helpers';
import { get1DIndexFrom } from './utils';

export class FloydWarshallState {
  protected _currentStep = 0;
  get currentStep() {
    return this._currentStep;
  }

  protected _currentLine: number = 1;
  get currentLine() {
    return this._currentLine;
  }
  protected _isDone = false;
  get isDone() {
    return this._isDone;
  }

  protected _V = 0;
  public get V(): number {
    return this._V;
  }
  protected _dist: number[] | undefined;
  get dist(): readonly number[] | undefined {
    return this._dist;
  }

  protected _next: (number | null)[] | undefined;
  get next(): readonly (number | null)[] | undefined {
    return this._next;
  }

  protected _u: number | undefined;
  public get u(): number | undefined {
    return this._u;
  }

  protected _v: number | undefined;
  public get v(): number | undefined {
    return this._v;
  }

  protected _k: number | undefined;
  public get k(): number | undefined {
    return this._k;
  }

  protected _i: number | undefined;
  public get i(): number | undefined {
    return this._i;
  }

  protected _j: number | undefined;
  public get j(): number | undefined {
    return this._j;
  }

  constructor(readonly adjacencyMatrix: readonly (readonly number[])[]) {
    this._V = adjacencyMatrix.length;
  }

  setCurrentStep(step: number): FloydWarshallState {
    const copy = this.clone();
    copy._currentStep = step;
    return copy;
  }

  setCurrentLine(line: number): FloydWarshallState {
    const copy = this.clone();
    copy._currentLine = line;
    return copy;
  }

  set_dist(matrix: number[]): FloydWarshallState {
    const copy = this.clone();
    copy._dist = matrix;
    return copy;
  }

  update_dist(i: number, j: number, value: number): FloydWarshallState {
    const copy = this.clone();
    const index = get1DIndexFrom(i, j, this._V);
    copy._dist![index] = value;
    return copy;
  }

  set_next(matrix: (number | null)[]): FloydWarshallState {
    const copy = this.clone();
    copy._next = matrix;
    return copy;
  }

  update_next(i: number, j: number, value: number | null): FloydWarshallState {
    const copy = this.clone();
    const index = get1DIndexFrom(i, j, this._V);
    copy._next![index] = value;
    return copy;
  }

  set_u(u: number | undefined): FloydWarshallState {
    const copy = this.clone();
    copy._u = u;
    return copy;
  }

  set_v(v: number | undefined): FloydWarshallState {
    const copy = this.clone();
    copy._v = v;
    return copy;
  }

  set_k(k: number | undefined): FloydWarshallState {
    const copy = this.clone();
    copy._k = k;
    return copy;
  }

  set_i(i: number | undefined): FloydWarshallState {
    const copy = this.clone();
    copy._i = i;
    return copy;
  }

  set_j(j: number | undefined): FloydWarshallState {
    const copy = this.clone();
    copy._j = j;
    return copy;
  }

  setIsDone(value: boolean): FloydWarshallState {
    const copy = this.clone();
    copy._isDone = value;
    return copy;
  }

  clone(): FloydWarshallState {
    const floydWarshall = new FloydWarshallState(this.adjacencyMatrix);
    floydWarshall._currentStep = this._currentStep;
    floydWarshall._currentLine = this._currentLine;
    floydWarshall._isDone = this._isDone;
    floydWarshall._V = this._V;
    floydWarshall._dist = this._dist ? [...this._dist] : undefined;
    floydWarshall._next = this._next ? [...this._next] : undefined;
    floydWarshall._u = this._u;
    floydWarshall._v = this._v;
    floydWarshall._k = this._k;
    floydWarshall._i = this._i;
    floydWarshall._j = this._j;
    return floydWarshall;
  }

  static from(encodedState: ArrayBuffer, adjacencyMatrix: readonly (readonly number[])[]): FloydWarshallState {
    const floydWarshall = new FloydWarshallState(adjacencyMatrix);
    const view = new DataView(encodedState);
    floydWarshall._currentStep = getCurrentStep(view);
    floydWarshall._currentLine = getCurrentLine(view);
    floydWarshall._isDone = getIsDone(view);
    floydWarshall._V = getV(view);
    floydWarshall._dist = getDist(view);
    floydWarshall._next = getNext(view);
    floydWarshall._u = get_u(view);
    floydWarshall._v = get_v(view);
    floydWarshall._k = get_k(view);
    floydWarshall._i = get_i(view);
    floydWarshall._j = get_j(view);
    return floydWarshall;
  }

  toBuffer(): ArrayBuffer {
    const view = make(this.adjacencyMatrix);
    setCurrentStep(this._currentStep, view);
    setCurrentLine(this._currentLine, view);
    setIsDone(this._isDone, view);
    setV(this._V, view);
    setDist(this._dist, view);
    setNext(this._next, view);
    set_u(this._u, view);
    set_v(this._v, view);
    set_k(this._k, view);
    set_i(this._i, view);
    set_j(this._j, view);
    return view.buffer;
  }
}
