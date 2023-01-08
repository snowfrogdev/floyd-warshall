import { animate, AnimationBuilder, query, stagger, style, transition, trigger } from '@angular/animations';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import {
  animationFrameScheduler,
  asapScheduler,
  asyncScheduler,
  BehaviorSubject,
  interval,
  Subject,
  Subscription,
  takeUntil,
  takeWhile,
} from 'rxjs';
import { AdjacencyMatrixService } from './adjacency-matrix.service';
import { FloydWarshall } from './floyd-warshall';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  @ViewChild('tileMapElement') tileMapElement!: ElementRef<HTMLElement>;
  @ViewChild('adjacencyMatrixCodeElement') adjacencyMatrixCodeElement!: ElementRef<HTMLElement>;
  @ViewChildren(MatTooltip) tooltips!: MatTooltip[];

  private pauseRequested = false;
  private isPaused = true;
  speed = 100;

  adjacencyMatrix!: number[][];
  tiles!: Tile[];
  numberOfCols = 0;
  numberOfRows = 0;
  //distForDisplay: number[][] = [];

  history: State[] = [];
  state = new State();

  get currentLine(): number | undefined {
    return this.state.floydWarshall?.currentLine;
  }

  get dist(): number[][] | undefined {
    return this.state.floydWarshall?.dist;
  }

  get next(): (number | null)[][] | undefined {
    return this.state.floydWarshall?.next;
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

  constructor(
    private adjacencyMatrixService: AdjacencyMatrixService,
    private animationBuilder: AnimationBuilder,
    private cdr: ChangeDetectorRef
  ) {}

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

    this.state.floydWarshall = new FloydWarshall(this.adjacencyMatrix);
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

  speedUp() {
    this.speed = Math.max(0, this.speed - 20);
  }

  slowDown() {
    this.speed += 10;
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
  floydWarshall?: FloydWarshall;

  clone(): State {
    const state = new State();
    state.debugging = this.debugging;
    state.floydWarshall = this.floydWarshall?.clone();
    return state;
  }
}
