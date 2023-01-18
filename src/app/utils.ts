type ValueTypes = string | number | boolean | null | undefined;
export function cloneMatrix<T extends ValueTypes>(matrix: readonly (readonly T[])[]): T[][] {
  return matrix.map((row) => [...row]);
}

export function get1DIndexFrom(y: number, x: number, matrixWidth: number): number {
  return y * matrixWidth + x;
}

export function get2DIndicesFrom(index: number, matrixWidth: number): [number, number] {
  return [Math.floor(index / matrixWidth), index % matrixWidth];
}

export function get1DMatrixFrom<T>(matrix: T[][] | readonly (readonly T[])[]): T[] {
  const matrix1D: T[] = [];
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      matrix1D.push(matrix[y][x]);
    }
  }
  return matrix1D;
}

export function get2DMatrixFrom<T>(matrix: T[] | readonly T[], matrixWidth: number): T[][] {
  const matrix2D: T[][] = [];
  for (let y = 0; y < matrix.length / matrixWidth; y++) {
    matrix2D.push(matrix.slice(y * matrixWidth, (y + 1) * matrixWidth));
  }
  return matrix2D;
}

export function estimateNumberOfStates(adjacencyMatrix: readonly (readonly number[])[]): number {
  const totalTiles = adjacencyMatrix.length;
  return (
    0.000642105 * totalTiles ** 4 +
    1.9431 * totalTiles ** 3 +
    11.0115 * totalTiles ** 2 -
    31.3267 * totalTiles +
    112.277
  );
}
