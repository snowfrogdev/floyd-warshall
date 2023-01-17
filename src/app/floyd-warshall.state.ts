import { immerable, produce } from 'immer';
import { cloneMatrix } from './utils';

export class FloydWarshallState {
  [immerable] = true;
  private _currentLine: number = 1;
  get currentLine() {
    return this._currentLine;
  }
  private set currentLine(value: number) {
    this._currentLine = value;
  }
  private _isDone = false;
  get isDone() {
    return this._isDone;
  }
  private set isDone(value: boolean) {
    this._isDone = value;
  }

  private _V = 0;
  get V(): number {
    return this._V;
  }
  private set V(value: number) {
    this._V = value;
  }

  private _dist: number[][] | undefined;
  get dist(): number[][] | undefined {
    return this._dist;
  }
  private set dist(value: number[][] | undefined) {
    this._dist = value;
  }

  private _next: (number | null)[][] | undefined;
  get next(): (number | null)[][] | undefined {
    return this._next;
  }
  private set next(value: (number | null)[][] | undefined) {
    this._next = value;
  }

  private _u: number | undefined;
  public get u(): number | undefined {
    return this._u;
  }
  private set u(value: number | undefined) {
    this._u = value;
  }

  private _v: number | undefined;
  public get v(): number | undefined {
    return this._v;
  }
  private set v(value: number | undefined) {
    this._v = value;
  }

  private _k: number | undefined;
  public get k(): number | undefined {
    return this._k;
  }
  private set k(value: number | undefined) {
    this._k = value;
  }

  private _i: number | undefined;
  public get i(): number | undefined {
    return this._i;
  }
  private set i(value: number | undefined) {
    this._i = value;
  }

  private _j: number | undefined;
  public get j(): number | undefined {
    return this._j;
  }
  private set j(value: number | undefined) {
    this._j = value;
  }

  constructor(readonly adjacencyMatrix: readonly (readonly number[])[]) {
    this._V = adjacencyMatrix.length;
  }

  setCurrentLine(line: number): FloydWarshallState {
    /* const copy = this.clone();
    copy._currentLine = line;
    return copy; */
    return produce(this, (draft) => {
      draft.currentLine = line;
    });
  }

  set_dist(matrix: number[][]): FloydWarshallState {
    /* const copy = this.clone();
    copy._dist = matrix;
    return copy; */
    return produce(this, (draft) => {
      draft.dist = matrix;
    });
  }

  update_dist(i: number, j: number, value: number): FloydWarshallState {
    /* const copy = this.clone();
    const dist = cloneMatrix(copy._dist!);
    dist[i][j] = value;
    copy._dist = dist;
    return copy; */
    return produce(this, (draft) => {
      draft.dist![i][j] = value;
    });
  }

  set_next(matrix: (number | null)[][]): FloydWarshallState {
    /* const copy = this.clone();
    copy._next = matrix;
    return copy; */
    return produce(this, (draft) => {
      draft.next = matrix;
    });
  }

  update_next(i: number, j: number, value: number | null): FloydWarshallState {
    /* const copy = this.clone();
    const next = cloneMatrix(copy._next!);
    next[i][j] = value;
    copy._next = next;
    return copy; */
    return produce(this, (draft) => {
      draft.next![i][j] = value;
    });
  }

  set_u(u: number | undefined): FloydWarshallState {
    /* const copy = this.clone();
    copy._u = u;
    return copy; */
    return produce(this, (draft) => {
      draft.u = u;
    });
  }

  set_v(v: number | undefined): FloydWarshallState {
    /* const copy = this.clone();
    copy._v = v;
    return copy; */
    return produce(this, (draft) => {
      draft.v = v;
    });
  }

  set_k(k: number | undefined): FloydWarshallState {
    /* const copy = this.clone();
    copy._k = k;
    return copy; */
    return produce(this, (draft) => {
      draft.k = k;
    });
  }

  set_i(i: number | undefined): FloydWarshallState {
    /* const copy = this.clone();
    copy._i = i;
    return copy; */
    return produce(this, (draft) => {
      draft.i = i;
    });
  }

  set_j(j: number | undefined): FloydWarshallState {
    /* const copy = this.clone();
    copy._j = j;
    return copy; */
    return produce(this, (draft) => {
      draft.j = j;
    });
  }

  setIsDone(value: boolean): FloydWarshallState {
    /* const copy = this.clone();
    copy._isDone = value;
    return copy; */
    return produce(this, (draft) => {
      draft.isDone = value;
    });
  }

  clone(): FloydWarshallState {
    /* const floydWarshall = new FloydWarshallState(cloneMatrix(this.adjacencyMatrix));
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
    return floydWarshall; */
    return produce(this, (draft) => {})
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
  _dist: number[][] | undefined;

  _next: [][] | undefined;

  _u: number | undefined;

  _v: number | undefined;

  _k: number | undefined;

  _i: number | undefined;

  _j: number | undefined;
  adjacencyMatrix: readonly (readonly number[])[];
}
