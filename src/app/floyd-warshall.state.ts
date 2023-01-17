import { get1DIndexFrom } from './utils';

export class FloydWarshallState {
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

  static from(dto: FloydWarshallStateDto): FloydWarshallState {
    const floydWarshall = new FloydWarshallState(dto.adjacencyMatrix);
    floydWarshall._currentLine = dto._currentLine;
    floydWarshall._isDone = dto._isDone;
    floydWarshall._V = dto._V;
    floydWarshall._dist = dto._dist;
    floydWarshall._next = dto._next;
    floydWarshall._u = dto._u;
    floydWarshall._v = dto._v;
    floydWarshall._k = dto._k;
    floydWarshall._i = dto._i;
    floydWarshall._j = dto._j;
    return floydWarshall;
  }
}

export interface FloydWarshallStateDto {
  _currentLine: number;
  _isDone: false;

  _V: number;
  _dist: number[] | undefined;

  _next: (number | null)[] | undefined;

  _u: number | undefined;

  _v: number | undefined;

  _k: number | undefined;

  _i: number | undefined;

  _j: number | undefined;
  adjacencyMatrix: readonly (readonly number[])[];
}
