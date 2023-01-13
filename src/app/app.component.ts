import { animate, AnimationBuilder, query, stagger, style, transition, trigger } from '@angular/animations';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChildren,
} from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { AdjacencyMatrixService } from './adjacency-matrix.service';
import { ControlsEvent, ControlsState } from './controls/controls.component';
import { FloydWarshallService } from './floyd-warshall.service';
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

  get distForDisplay(): readonly (readonly number[])[] | undefined {
    return this.dist;
  }

  get nextForDisplay(): readonly (readonly (number | null)[])[] | undefined {
    return this.next;
  }

  controlsState = new ControlsState(true, true, false, false, false);

  get lineToHighlight(): number | undefined {
    if (this.stateMachine.currentState === 'start' || this.stateMachine.currentState === 'end') return;
    return this.floydWarshallService.state.currentLine;
  }

  get dist(): readonly (readonly number[])[] | undefined {
    return this.floydWarshallService.state.dist;
  }

  get next(): readonly (readonly (number | null)[])[] | undefined {
    return this.floydWarshallService.state.next;
  }

  get V(): number {
    return this.floydWarshallService.state.V;
  }

  get u(): number | undefined {
    return this.floydWarshallService.state.u;
  }

  get v(): number | undefined {
    return this.floydWarshallService.state.v;
  }

  get k(): number | undefined {
    return this.floydWarshallService.state.k;
  }

  get i(): number | undefined {
    return this.floydWarshallService.state.i;
  }

  get j(): number | undefined {
    return this.floydWarshallService.state.j;
  }

  get isDone() {
    return this.floydWarshallService.state.isDone;
  }

  private breakpoints = new Set<number>();

  constructor(
    private adjacencyMatrixService: AdjacencyMatrixService,
    private stateMachine: StateMachineService,
    private floydWarshallService: FloydWarshallService,
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
    this.floydWarshallService.initialize(this.adjacencyMatrix);

    this.floydWarshallService.state$.subscribe((state) => {
      if (state.isDone) {
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

            this.floydWarshallService.stepForward();
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
        this.floydWarshallService.reset();
        this.stateMachine.transitionTo('start');
        break;
      }
      case 'step-back': {
        if (this.floydWarshallService.state.currentLine === 1) {
          this.floydWarshallService.stepBackward();
          this.stateMachine.transitionTo('start');
          break;
        }

        if (this.stateMachine.currentState === 'end') {
          this.floydWarshallService.stepBackward();
          this.stateMachine.transitionTo('paused');
          break;
        }

        this.floydWarshallService.stepBackward();
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
        this.floydWarshallService.stepForward();
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
