export class AdjacencyMatrix {
  private _matrix!: number[][];
  get matrix(): readonly (readonly number[])[] {
    return this._matrix;
  }

  constructor(tileMap: string) {
    this.buildMatrix(tileMap);
  }

  private buildMatrix(tileMap: string): void {
    // Split the tile map into an array of rows
    const rows: string[] = tileMap.split(/\r?\n/);
    const numRows = rows.length;
    const numCols = rows[0].length;

    this._matrix = Array.from({ length: numRows * numCols }, () => Array(numRows * numCols).fill(0));

    // Iterate through the rows and columns of the map
    for (let i = 0; i < numRows; i++) {
      for (let j = 0; j < numCols; j++) {
        // If the current tile is not a wall, add edges to its neighbors
        if (rows[i][j] === '.') {
          this.addEdges(rows, i, j);
        }
      }
    }
  }

  private addEdges(rows: string[], i: number, j: number): void {
    const numRows = rows.length;
    const numCols = rows[0].length;
    // Calculate the index of the current tile in the adjacency matrix
    const index = i * numCols + j;

    // Add an edge to the tile to the left, if it exists and is not a wall
    if (j > 0 && rows[i][j - 1] === '.') {
      this._matrix[index][index - 1] = 1;
    }
    // Add an edge to the tile to the right, if it exists and is not a wall
    if (j < numCols - 1 && rows[i][j + 1] === '.') {
      this._matrix[index][index + 1] = 1;
    }
    // Add an edge to the tile above, if it exists and is not a wall
    if (i > 0 && rows[i - 1][j] === '.') {
      this._matrix[index][index - numCols] = 1;
    }
    // Add an edge to the tile below, if it exists and is not a wall
    if (i < numRows - 1 && rows[i + 1][j] === '.') {
      this._matrix[index][index + numCols] = 1;
    }
  }
}
