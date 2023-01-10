import { animate, AnimationBuilder, query, stagger, style, transition, trigger } from '@angular/animations';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { Observable } from 'rxjs';
import { AdjacencyMatrixService } from './adjacency-matrix.service';
import { FloydWarshall } from './floyd-warshall';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('collectionAnimation', [
      /* transition(':enter', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(-100px)' }),
            stagger(5, [animate('500ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'none' }))]),
          ],
          { optional: true }
        ),
      ]),      transition(':leave', [
        query(
          ':leave',
          [
            stagger(5, [
              animate('500ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 0, transform: 'translateY(-100px)' })),
            ]),
          ],
          { optional: true }
        ),
      ]), */
    ]),
  ],
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('adjacencyMatrixCodeElement') adjacencyMatrixCodeElement!: ElementRef<HTMLElement>;
  @ViewChildren(MatTooltip) tooltips!: MatTooltip[];

  private pauseRequested = false;
  isPaused = true;
  speed = 100;

  adjacencyMatrix!: number[][];
  tiles!: Tile[];
  numberOfCols = 0;
  numberOfRows = 0;
  get distForDisplay(): Observable<number[][] | undefined> {
    return this.dist;
  }

  get nextForDisplay(): Observable<(number | null)[][] | undefined> {
    return this.next;
  }

  history: State[] = [];
  state!: State;

  get currentLine(): number | undefined {
    if (!this.state.debugging) return;
    return this.state.floydWarshall.currentLine;
  }

  get dist(): Observable<number[][] | undefined> {
    return this.state.floydWarshall.dist;
  }

  get next(): Observable<(number | null)[][] | undefined> {
    return this.state.floydWarshall.next;
  }

  get V(): number | undefined {
    return this.state.floydWarshall?.V;
  }

  get u(): number | undefined {
    return this.state.floydWarshall?.u;
  }

  get v(): number | undefined {
    return this.state.floydWarshall?.v;
  }

  get k(): number | undefined {
    return this.state.floydWarshall?.k;
  }

  get i(): number | undefined {
    return this.state.floydWarshall?.i;
  }

  get j(): number | undefined {
    return this.state.floydWarshall?.j;
  }

  private breakpoints = new Set<number>();

  constructor(private adjacencyMatrixService: AdjacencyMatrixService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    const tileMap = `...
...
...`;

    const rows: string[] = tileMap.split(/\r?\n/);
    this.numberOfRows = rows.length;
    this.numberOfCols = rows[0].length;
    this.tiles = rows
      .join('')
      .split('')
      .map((char) => (char === '#' ? new Tile('black') : new Tile('white')));

    this.adjacencyMatrix = this.adjacencyMatrixService.generateAdjacencyMatrix(tileMap);
    this.state = new State(new FloydWarshall(this.adjacencyMatrix));
  }

  ngAfterViewInit() {
    for (const tooltip of this.tooltips) {
      tooltip.disabled = true;
    }
  }

  slidderLabel(value: number): string {
    return `${value}%`;
  }

  stepForward() {
    this.history.push(this.state.clone());

    if (this.state.debugging) {
      this.state.floydWarshall!.stepForward();
      return;
    }

    for (const tooltip of this.tooltips) {
      tooltip.disabled = false;
    }
    this.state.debugging = true;
  }

  stepBackward() {
    if (this.history.length === 0) {
      return;
    }

    this.state = this.history.pop()!;
  }

  reset() {
    this.state = this.history[0];
    this.history = [];
  }

  playOrPause() {
    if (this.isPaused) {
      this.play();
      return;
    }

    this.pause();
  }

  play() {
    if (!this.isPaused) return;
    this.isPaused = false;

    const asyncLoop = () => {
      setTimeout(() => {
        this.stepForward();

        if (this.breakpoints.has(this.currentLine!)) {
          this.pause();
        }

        this.cdr.markForCheck();
        if (this.pauseRequested) {
          this.pauseRequested = false;
          this.isPaused = true;
          return;
        }
        asyncLoop();
      }, 500 - (this.speed / 100) * 500);
    };
    asyncLoop();
  }

  pause() {
    this.pauseRequested = true;
  }

  handleDebuggerPoint(event: { line: number; isSet: boolean }) {
    if (event.isSet) {
      this.breakpoints.add(event.line);
    } else {
      this.breakpoints.delete(event.line);
    }
  }

  getDistElementBackgroundColor(value: number): string {
    // If value is infinity, return red
    if (value === Infinity) {
      return 'red';
    }

    const ratio = (2 * (value - 0)) / (this.numberOfCols * this.numberOfRows - 0);
    let b = 255;
    let g = Math.max(0, Math.ceil(255 * (1 - ratio)));
    let r = Math.max(0, Math.ceil(255 * (1 - ratio)));
    return `rgb(${r}, ${g}, ${b})`;
  }

  getNextElementBackgroundColor(value: number | null): string {
    // If value is null, return red
    if (value === null) {
      return 'red';
    }

    const ratio = (2 * (value - 0)) / (this.numberOfCols * this.numberOfRows - 0);
    let b = Math.max(0, Math.ceil(255 * (1 - ratio)));
    let g = 255;
    let r = Math.max(0, Math.ceil(255 * (1 - ratio)));
    return `rgb(${r}, ${g}, ${b})`;
  }
}

class Tile {
  constructor(public color: string) {}
}

function resample(matrix: number[][], factor: number): number[][] {
  const newRows = Math.floor(matrix.length / factor);
  const newCols = Math.floor(matrix[0].length / factor);
  const resampled: number[][] = [];

  for (let row = 0; row < newRows; row++) {
    const newRow: number[] = [];
    for (let col = 0; col < newCols; col++) {
      let sum = 0;
      for (let i = 0; i < factor; i++) {
        for (let j = 0; j < factor; j++) {
          sum += matrix[row * factor + i][col * factor + j];
        }
      }
      newRow.push(sum / (factor * factor));
    }
    resampled.push(newRow);
  }

  return resampled;
}

class State {
  debugging = false;
  constructor(public floydWarshall: FloydWarshall) {}

  clone(): State {
    const state = new State(this.floydWarshall.clone());
    state.debugging = this.debugging;
    return state;
  }
}
