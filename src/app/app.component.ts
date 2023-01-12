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
import { Observable, tap } from 'rxjs';
import { AdjacencyMatrixService } from './adjacency-matrix.service';
import { ControlsEvent, ControlsState } from './controls/controls.component';
import { FloydWarshall } from './floyd-warshall';
import { StateMachineService } from './state-machine.service';

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
  @ViewChildren(MatTooltip) tooltips!: MatTooltip[];

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
  controlsState = new ControlsState(true, true, false, false, false);

  get lineToHighlight(): number | undefined {
    if (this.stateMachine.currentState === 'start' || this.stateMachine.currentState === 'end') return;
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

  get isDone(): Observable<boolean> {
    return this.state.floydWarshall.isDone;
  }

  private breakpoints = new Set<number>();

  constructor(
    private adjacencyMatrixService: AdjacencyMatrixService,
    private stateMachine: StateMachineService,
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
    this.state = new State(new FloydWarshall(this.adjacencyMatrix));

    this.isDone.subscribe((isDone) => {
      if (isDone) {
        this.stateMachine.transitionTo('end');
      }
    });

    this.stateMachine.transition.subscribe((transition) => {
      switch (transition.to) {
        case 'start': {
          this.controlsState = new ControlsState(true, true, false, false, false);
          for (const tooltip of this.tooltips) {
            tooltip.disabled = false;
          }
          this.state = this.history[0];
          this.history = [];
          break;
        }
        case 'running': {
          this.controlsState = new ControlsState(false, true, false, true, true);
          const asyncLoop = () => {
            if (
              this.stateMachine.currentState === 'start' ||
              this.stateMachine.currentState === 'paused' ||
              this.stateMachine.currentState === 'end'
            ) {
              return;
            }

            this.history.push(this.state.clone());
            this.state.floydWarshall!.stepForward();
            this.cdr.markForCheck();

            if (this.breakpoints.has(this.lineToHighlight!)) {
              this.stateMachine.transitionTo('paused');
              return;
            }

            setTimeout(asyncLoop, 500 - (this.speed / 100) * 500);
          };
          asyncLoop();
          break;
        }
        case 'paused': {
          this.controlsState = new ControlsState(false, false, false, false, false);
          break;
        }
        case 'end': {
          this.controlsState = new ControlsState(false, false, true, false, true);
          break;
        }
      }

      if (transition.from === 'start') {
        for (const tooltip of this.tooltips) {
          tooltip.disabled = false;
        }
      }
    });
  }

  ngAfterViewInit() {
    for (const tooltip of this.tooltips) {
      tooltip.disabled = true;
    }
  }

  handleDebuggerPoint(event: { line: number; isSet: boolean }) {
    if (event.isSet) {
      this.breakpoints.add(event.line);
    } else {
      this.breakpoints.delete(event.line);
    }
  }

  handleControls(event: ControlsEvent) {
    switch (event) {
      case 'reset': {
        this.stateMachine.transitionTo('start');
        break;
      }
      case 'step-back': {
        if (this.history.length === 1) {
          this.stateMachine.transitionTo('start');
          break;
        }

        this.state = this.history.pop()!;
        if (this.stateMachine.currentState === 'end') {
          this.stateMachine.transitionTo('paused');
        }
        break;
      }
      case 'play-pause': {
        if (this.stateMachine.currentState === 'paused' || this.stateMachine.currentState === 'start') {
          this.stateMachine.transitionTo('running');
        } else {
          this.stateMachine.transitionTo('paused');
        }
        break;
      }
      case 'step-forward': {
        if (this.stateMachine.currentState === 'start') {
          this.stateMachine.transitionTo('paused');
        }

        this.history.push(this.state.clone());
        this.state.floydWarshall!.stepForward();
        break;
      }
      default: {
        this.speed = event;
      }
    }
  }

  getDistElementBackgroundColor(value: number): string {
    // If value is infinity, return red
    if (value === Infinity) {
      return 'red';
    }

    const ratio = value / (this.numberOfCols * this.numberOfRows);
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

    const ratio = value / (this.numberOfCols * this.numberOfRows);
    let b = Math.max(0, Math.ceil(255 * ratio));
    let g = Math.max(0, Math.ceil(255 * (1 - ratio)));
    let r = 0;
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
  constructor(public floydWarshall: FloydWarshall) {}

  clone(): State {
    const state = new State(this.floydWarshall.clone());
    return state;
  }
}
