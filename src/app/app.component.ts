import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChildren,
} from '@angular/core';
import { MatSliderDragEvent } from '@angular/material/slider';
import { MatTooltip } from '@angular/material/tooltip';
import { Observable } from 'rxjs';
import { AdjacencyMatrixService } from './adjacency-matrix.service';
import { ControlsEvent, ControlsState } from './controls/controls.component';
import { FloydWarshallService } from './floyd-warshall.service';
import { RulesEngineService } from './rules-engine.service';
import { StateMachineService } from './state-machine.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  controlsState: ControlsState = {
    isResetDisabled: true,
    isStepBackDisabled: true,
    isPlayPauseDisabled: false,
    isPlaying: false,
    isStepForwardDisabled: false,
  };

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

  get isDone(): boolean {
    return this.floydWarshallService.state.isDone;
  }

  get progressValue(): Observable<number> {
    return this.floydWarshallService.progressValue$;
  }

  get bufferValue(): Observable<number> {
    return this.floydWarshallService.bufferValue$;
  }

  readonly breakpoints = new Set<number>();

  constructor(
    private adjacencyMatrixService: AdjacencyMatrixService,
    readonly stateMachine: StateMachineService,
    private rulesEngine: RulesEngineService,
    readonly floydWarshallService: FloydWarshallService,
    readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const tileMap = `......
.#....
.#....
.#....
.#....
......`;

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
      this.rulesEngine.execute(transition, this);
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
    this.rulesEngine.execute(event, this);
  }

  getDistElementBackgroundColor(value: number): string {
    // If value is infinity, return red
    if (value === Infinity) {
      return 'grey';
    }

    const ratio = value / (this.numberOfCols * this.numberOfRows);
    let b = 255;
    let g = Math.max(0, Math.ceil(255 * (1 - ratio)));
    let r = Math.max(0, Math.ceil(255 * (1 - ratio)));
    return `rgb(${r}, ${g}, ${b})`;
  }

  getNextElementBackgroundColor(value: number | null): string {
    if (value === null) {
      return 'grey';
    }

    const ratio = value / (this.numberOfCols * this.numberOfRows);
    let b = Math.max(0, Math.ceil(255 * ratio));
    let g = Math.max(0, Math.ceil(255 * (1 - ratio)));
    let r = 0;
    return `rgb(${r}, ${g}, ${b})`;
  }

  isEvaluated(u: number, v: number): boolean {
    return (
      (this.u === u && this.v === v) ||
      (this.i === u && this.j === v) ||
      (this.i === u && this.k === v) ||
      (this.k === u && this.j === v)
    );
  }

  getMatrixOutlineStyle(u: number, v: number): string {
    if (this.isEvaluated(u, v)) {
      return '2px solid red';
    }
    return '1px solid black';
  }

  reconstructPath(u: number, v: number): number[] {
    if (this.next![u][v] === null) return [];
    const path = [u];
    while (u !== v) {
      u = this.next![u][v] as number;
      path.push(u);
    }
    return path;
  }

  seek(percentage: number) {
    this.stateMachine.transitionTo('seeking');
    this.floydWarshallService.seek(percentage);
  }

  seekEnd(dragEvent: MatSliderDragEvent) {
    switch (dragEvent.value) {
      case 0: {
        this.stateMachine.transitionTo('start');
        break;
      }
      case 100: {
        this.stateMachine.transitionTo('end');
        break;
      }
      default: {
        this.stateMachine.transitionTo('paused');
        break;
      }
    }
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
