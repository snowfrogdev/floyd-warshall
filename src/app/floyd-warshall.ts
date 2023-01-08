export class FloydWarshall {
  private _currentLine: number = 2;
  get currentLine() {
    return this._currentLine;
  }

  private _isDone = false;
  get isDone(): boolean {
    return this._isDone;
  }

  private _V = 0;
  public get V(): number {
    return this._V;
  }
  private _dist: number[][] | undefined;
  get dist(): number[][] | undefined {
    return this._dist;
  }

  private _next: (number | null)[][] | undefined;
  public get next(): (number | null)[][] | undefined {
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

  constructor(readonly adjacencyMatrix: number[][]) {
    this._V = adjacencyMatrix.length;
  }

  lines: Map<number, () => void> = new Map([
    [
      2,
      () => {
        this._dist = [...this.adjacencyMatrix];
        this._currentLine++;
      },
    ],
    [
      3,
      () => {
        this._next = Array.from({ length: this.adjacencyMatrix.length }, () =>
          Array(this.adjacencyMatrix.length).fill(null)
        );
        this._currentLine++;
      },
    ],
    [
      4,
      () => {
        this._u = this._u === undefined ? 0 : this._u + 1;
        if (this._u! >= this._V) {
          this._u = undefined;
          this._currentLine = 15;
          return;
        }
        this._currentLine++;
      },
    ],
    [
      5,
      () => {
        this._v = this._v === undefined ? 0 : this._v + 1;
        if (this._v! >= this._V) {
          this._v = undefined;
          this._currentLine = 4;
          return;
        }
        this._currentLine++;
      },
    ],
    [
      6,
      () => {
        if (this._u === this._v) {
          this._currentLine++;
          return;
        }
        this._currentLine = 9;
      },
    ],
    [
      7,
      () => {
        this._dist![this._v!][this._v!] = 0;
        this._currentLine++;
      },
    ],
    [
      8,
      () => {
        this._next![this._v!][this._v!] = this._v!;
        this._currentLine = 5;
      },
    ],
    [
      9,
      () => {
        if (this.adjacencyMatrix[this._u!][this._v!] !== 0) {
          this._currentLine++;
          return;
        }
        this._currentLine = 12;
      },
    ],
    [
      10,
      () => {
        this._next![this._u!][this._v!] = this._v!;
        this._currentLine = 5;
      },
    ],
    [
      12,
      () => {
        this._dist![this._u!][this._v!] = Infinity;
        this._currentLine++;
      },
    ],
    [
      13,
      () => {
        this._next![this._u!][this._v!] = null;
        this._currentLine = 5;
      },
    ],
    [
      15,
      () => {
        this._k = this._k === undefined ? 0 : this._k + 1;
        if (this._k! >= this._V) {
          this._k = undefined;
          this._currentLine = 21;
          return;
        }
        this._currentLine++;
      },
    ],
    [
      16,
      () => {
        this._i = this._i === undefined ? 0 : this._i + 1;
        if (this._i! >= this._V) {
          this._i = undefined;
          this._currentLine = 15;
          return;
        }
        this._currentLine++;
      },
    ],
    [
      17,
      () => {
        this._j = this._j === undefined ? 0 : this._j + 1;
        if (this._j! >= this._V) {
          this._j = undefined;
          this._currentLine = 16;
          return;
        }
        this._currentLine++;
      },
    ],
    [
      18,
      () => {
        if (this._dist![this._i!][this._j!] > this._dist![this._i!][this._k!] + this._dist![this._k!][this._j!]) {
          this._currentLine++;
          return;
        }
        this._currentLine = 17;
      },
    ],
    [
      19,
      () => {
        this._dist![this._i!][this._j!] = this._dist![this._i!][this._k!] + this._dist![this._k!][this._j!];
        this._currentLine++;
      },
    ],
    [
      20,
      () => {
        this._next![this._i!][this._j!] = this._next![this._i!][this._k!];
        this._currentLine = 17;
      },
    ],
    [
      22,
      () => {
        this._isDone = true;
        this._currentLine++;
      },
    ],
  ]);

  stepForward() {
    this.lines.get(this._currentLine)!();
  }

  clone(): FloydWarshall {
    const floydWarshall = new FloydWarshall(this.adjacencyMatrix);
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
}
