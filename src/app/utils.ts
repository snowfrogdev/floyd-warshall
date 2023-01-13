type ValueTypes = string | number | boolean | null | undefined;
export function cloneMatrix<T extends ValueTypes>(matrix: readonly (readonly T[])[]): T[][] {
  return matrix.map((row) => [...row]);
}
