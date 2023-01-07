import { animate, AnimationBuilder, query, stagger, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewChild, ViewChildren } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { animationFrameScheduler, asapScheduler, asyncScheduler, BehaviorSubject, interval, Subject, Subscription, takeUntil, takeWhile } from 'rxjs';
import { FloydWarshall } from './floyd-warshall';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    /* trigger('distAnimation', [
      transition(':enter', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(-100px)' }),
            stagger(5, [animate('500ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'none' }))]),
          ],
          { optional: true }
        ),
      ]),
      transition(':leave', [
        query(
          ':leave',
          [
            stagger(5, [
              animate('500ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 0, transform: 'translateY(-100px)' })),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]), */
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  @ViewChild('tileMapElement') tileMapElement!: ElementRef<HTMLElement>;
  @ViewChild('adjacencyMatrixCodeElement') adjacencyMatrixCodeElement!: ElementRef<HTMLElement>;
  @ViewChildren(MatTooltip) tooltips!: MatTooltip[];

  private isPaused = true;
  private speed = 200;

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

  constructor(private animationBuilder: AnimationBuilder, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    const tileMap = `####
#  #
####`;

    const rows: string[] = tileMap.split(/\r?\n/);
    this.numberOfRows = rows.length;
    this.numberOfCols = rows[0].length;
    this.tiles = rows
      .join('')
      .split('')
      .map((char) => (char === '#' ? new Tile('black') : new Tile('white')));

    this.adjacencyMatrix = this.generateAdjacencyMatrix(tileMap);
  }

  generateAdjacencyMatrix(tileMap: string): number[][] {
    // Split the tile map into an array of rows
    const rows = tileMap.split(/\r?\n/);

    // Get the number of rows and columns in the map
    const numRows = rows.length;
    const numCols = rows[0].length;

    // Initialize the adjacency matrix with all zeros
    const adjacencyMatrix: number[][] = Array.from({ length: numRows * numCols }, () =>
      Array(numRows * numCols).fill(0)
    );

    // Iterate through the rows and columns of the map
    for (let i = 0; i < numRows; i++) {
      for (let j = 0; j < numCols; j++) {
        // Calculate the index of the current tile in the adjacency matrix
        const index = i * numCols + j;

        // If the current tile is not a wall, add edges to its neighbors
        if (rows[i][j] === ' ') {
          // Add an edge to the tile to the left, if it exists and is not a wall
          if (j > 0 && rows[i][j - 1] === ' ') {
            adjacencyMatrix[index][index - 1] = 1;
          }
          // Add an edge to the tile to the right, if it exists and is not a wall
          if (j < numCols - 1 && rows[i][j + 1] === ' ') {
            adjacencyMatrix[index][index + 1] = 1;
          }
          // Add an edge to the tile above, if it exists and is not a wall
          if (i > 0 && rows[i - 1][j] === ' ') {
            adjacencyMatrix[index][index - numCols] = 1;
          }
          // Add an edge to the tile below, if it exists and is not a wall
          if (i < numRows - 1 && rows[i + 1][j] === ' ') {
            adjacencyMatrix[index][index + numCols] = 1;
          }
        }
      }
    }

    return adjacencyMatrix;
  }

  ngAfterViewInit() {
    for (const tooltip of this.tooltips) {
      tooltip.disabled = true;
    }
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

    /* if (this.stepThree) {
      this.stepThree = false;
      this.stepFour = true;
      this.dist = [...this.adjacencyMatrix];
      this.distForDisplay = resample(this.dist, 10);
      return;
    }

    if (this.stepTwo.value) {
      this.stepThree = true;
      this.stepTwo.next(false);
      return;
    }

    if (this.stepOne.value) {
      const tileMapElement = this.tileMapElement.nativeElement;
      const codeElement = this.adjacencyMatrixCodeElement.nativeElement;
      const mapOffsetLeft = tileMapElement.offsetLeft + tileMapElement.offsetWidth / 2;
      const mapOffsetTop = tileMapElement.offsetTop + tileMapElement.offsetHeight / 2;
      const codeOffsetLeft = codeElement.offsetLeft + codeElement.offsetWidth / 2;
      const codeOffsetTop = codeElement.offsetTop + codeElement.offsetHeight / 2;
      const animation = this.animationBuilder.build([
        animate(
          '500ms cubic-bezier(.3,.8,.26,.94)',
          style({
            transform: `translate(${codeOffsetLeft - mapOffsetLeft}px, ${codeOffsetTop - mapOffsetTop}px) scale(0)`,
          })
        ),
      ]);
      const player = animation.create(this.tileMapElement.nativeElement);
      player.play();
      player.onDone(() => {
        this.stepTwo.next(true);
        this.stepOne.next(false);
        player.destroy();
      });
    } */
  }

  stepBackward() {
    if (this.history.length === 0) {
      return;
    }

    this.state = this.history.pop()!;

    /* if (this.stepFour) {
      this.stepFour = false;
      this.stepThree = true;
      this.distForDisplay = [];
      this.dist = [];
      return;
    }
    if (this.stepThree) {
      this.stepThree = false;
      this.stepTwo.next(true);
      return;
    }
    if (this.stepTwo.value) {
      this.stepTwo.next(false);
      this.stepOne.next(true);
      const tileMapElement = this.tileMapElement.nativeElement;
      const codeElement = this.adjacencyMatrixCodeElement.nativeElement;
      const mapOffsetLeft = tileMapElement.offsetLeft + tileMapElement.offsetWidth / 2;
      const mapOffsetTop = tileMapElement.offsetTop + tileMapElement.offsetHeight / 2;
      const codeOffsetLeft = codeElement.offsetLeft + codeElement.offsetWidth / 2;
      const codeOffsetTop = codeElement.offsetTop + codeElement.offsetHeight / 2;
      const animation = this.animationBuilder.build([
        style({
          transform: `translate(${codeOffsetLeft - mapOffsetLeft}px, ${codeOffsetTop - mapOffsetTop}px) scale(0)`,
        }),
        animate(
          '500ms cubic-bezier(.74,.06,.7,.2)',
          style({
            transform: `translate(0, 0) scale(1)`,
          })
        ),
      ]);
      const player = animation.create(this.tileMapElement.nativeElement);
      player.play();
      player.onDone(() => {
        player.destroy();
      });
      return;
    } */
  }

  reset() {
    this.state = this.history[0];
    this.history = [];
  }

  play() {
    this.isPaused = false;

    const asyncLoop = () => {
      setTimeout(() => {
        this.stepForward();
        this.cdr.markForCheck();
        if (this.isPaused) return;
        asyncLoop();
      }, this.speed);
    };
    asyncLoop();
  }

  pause() {
    this.isPaused = true;
  }

  speedUp() {
    this.speed = Math.min(0, this.speed - 20);
  }

  slowDown() {
    this.speed += 10;
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
