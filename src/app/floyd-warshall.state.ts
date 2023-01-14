import { cloneMatrix } from './utils';

export class FloydWarshallState {
  private _currentLine: number = 1;
  get currentLine() {
    return this._currentLine;
  }
  private _isDone = false;
  get isDone() {
    return this._isDone;
  }

  private _V = 0;
  public get V(): number {
    return this._V;
  }
  private _dist: readonly (readonly number[])[] | undefined;
  get dist(): readonly (readonly number[])[] | undefined {
    return this._dist;
  }

  private _next: readonly (readonly (number | null)[])[] | undefined;
  get next(): readonly (readonly (number | null)[])[] | undefined {
    return this._next;
  }

  private _u: number | undefined;
  public get u(): number | undefined {
    return this._u;
  }

  private _v: number | undefined;
  public get v(): number | undefined {
    return this._v;
  }

  private _k: number | undefined;
  public get k(): number | undefined {
    return this._k;
  }

  private _i: number | undefined;
  public get i(): number | undefined {
    return this._i;
  }

  private _j: number | undefined;
  public get j(): number | undefined {
    return this._j;
  }

  constructor(readonly adjacencyMatrix: readonly (readonly number[])[]) {
    this._V = adjacencyMatrix.length;
  }

  setCurrentLine(line: number): FloydWarshallState {
    const copy = this.clone();
    copy._currentLine = line;
    return copy;
  }

  set_dist(matrix: readonly (readonly number[])[]): FloydWarshallState {
    const copy = this.clone();
    copy._dist = matrix;
    return copy;
  }

  update_dist(i: number, j: number, value: number): FloydWarshallState {
    const copy = this.clone();
    const dist = cloneMatrix(copy._dist!);
    dist[i][j] = value;
    copy._dist = dist;
    return copy;
  }

  set_next(matrix: readonly (readonly (number | null)[])[]): FloydWarshallState {
    const copy = this.clone();
    copy._next = matrix;
    return copy;
  }

  update_next(i: number, j: number, value: number | null): FloydWarshallState {
    const copy = this.clone();
    const next = cloneMatrix(copy._next!);
    next[i][j] = value;
    copy._next = next;
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
    const floydWarshall = new FloydWarshallState(cloneMatrix(this.adjacencyMatrix));
    floydWarshall._currentLine = this._currentLine;
    floydWarshall._isDone = this._isDone;
    floydWarshall._V = this._V;
    floydWarshall._dist = this._dist ? cloneMatrix(this._dist) : undefined;
    floydWarshall._next = this._next ? cloneMatrix(this._next) : undefined;
    floydWarshall._u = this._u;
    floydWarshall._v = this._v;
    floydWarshall._k = this._k;
    floydWarshall._i = this._i;
    floydWarshall._j = this._j;
    return floydWarshall;
  }
}