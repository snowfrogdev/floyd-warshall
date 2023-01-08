import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AdjacencyMatrixService {
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
        if (rows[i][j] === '.') {
          // Add an edge to the tile to the left, if it exists and is not a wall
          if (j > 0 && rows[i][j - 1] === '.') {
            adjacencyMatrix[index][index - 1] = 1;
          }
          // Add an edge to the tile to the right, if it exists and is not a wall
          if (j < numCols - 1 && rows[i][j + 1] === '.') {
            adjacencyMatrix[index][index + 1] = 1;
          }
          // Add an edge to the tile above, if it exists and is not a wall
          if (i > 0 && rows[i - 1][j] === '.') {
            adjacencyMatrix[index][index - numCols] = 1;
          }
          // Add an edge to the tile below, if it exists and is not a wall
          if (i < numRows - 1 && rows[i + 1][j] === '.') {
            adjacencyMatrix[index][index + numCols] = 1;
          }
        }
      }
    }

    return adjacencyMatrix;
  }
}
