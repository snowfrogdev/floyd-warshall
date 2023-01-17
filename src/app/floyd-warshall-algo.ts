import { FloydWarshallState } from './floyd-warshall.state';
import { get1DIndexFrom, get1DMatrixFrom } from './utils';

/**
 * Each line of the algorithm is represented by a function that is executed when the line is reached.
 * The function returns a tuple of the new state and the next line to execute. If the next line is not
 * specified, the next line is the next line in the algorithm.
 */
export const lines = new Map<number, (state: FloydWarshallState) => [FloydWarshallState?, number?]>([
  [1, (state: FloydWarshallState) => []],
  [2, (state: FloydWarshallState) => [state.set_dist(get1DMatrixFrom(state.adjacencyMatrix))]],
  [3, (state: FloydWarshallState) => [state.set_next(Array.from({ length: state.V * state.V }, () => null))]],
  [
    4,
    (state: FloydWarshallState) => {
      let newState = state.set_u(state.u === undefined ? 0 : state.u + 1);
      if (newState.u! >= newState.V) {
        newState = newState.set_u(undefined);
        return [newState, 15];
      }
      return [newState];
    },
  ],
  [
    5,
    (state: FloydWarshallState) => {
      let newState = state.set_v(state.v === undefined ? 0 : state.v + 1);
      if (newState.v! >= newState.V) {
        newState = newState.set_v(undefined);
        return [newState, 4];
      }
      return [newState];
    },
  ],
  [
    6,
    (state: FloydWarshallState) => {
      if (state.u === state.v) {
        return [];
      }
      return [, 9];
    },
  ],
  [7, (state: FloydWarshallState) => [state.update_dist(state.v!, state.v!, 0)]],
  [8, (state: FloydWarshallState) => [state.update_next(state.v!, state.v!, state.v!), 5]],
  [
    9,
    (state: FloydWarshallState) => {
      if (state.adjacencyMatrix[state.u!][state.v!] !== 0) {
        return [];
      }
      return [, 12];
    },
  ],
  [10, (state: FloydWarshallState) => [state.update_next(state.u!, state.v!, state.v!), 5]],
  [12, (state: FloydWarshallState) => [state.update_dist(state.u!, state.v!, Infinity)]],
  [13, (state: FloydWarshallState) => [state.update_next(state.u!, state.v!, null), 5]],
  [
    15,
    (state: FloydWarshallState) => {
      let newState = state.set_k(state.k === undefined ? 0 : state.k + 1);
      if (newState.k! >= newState.V) {
        newState = newState.set_k(undefined);
        return [newState, 22];
      }
      return [newState];
    },
  ],
  [
    16,
    (state: FloydWarshallState) => {
      let newState = state.set_i(state.i === undefined ? 0 : state.i + 1);
      if (newState.i! >= newState.V) {
        newState = newState.set_i(undefined);
        return [newState, 15];
      }
      return [newState];
    },
  ],
  [
    17,
    (state: FloydWarshallState) => {
      let newState = state.set_j(state.j === undefined ? 0 : state.j + 1);
      if (newState.j! >= newState.V) {
        newState = newState.set_j(undefined);
        return [newState, 16];
      }
      return [newState];
    },
  ],
  [
    18,
    (state: FloydWarshallState) => {
      if (
        state.dist![get1DIndexFrom(state.i!, state.j!, state.V)] >
        state.dist![get1DIndexFrom(state.i!, state.k!, state.V)] +
          state.dist![get1DIndexFrom(state.k!, state.j!, state.V)]
      ) {
        return [];
      }
      return [, 17];
    },
  ],
  [
    19,
    (state: FloydWarshallState) => [
      state.update_dist(
        state.i!,
        state.j!,
        state.dist![get1DIndexFrom(state.i!, state.k!, state.V)] +
          state.dist![get1DIndexFrom(state.k!, state.j!, state.V)]
      ),
    ],
  ],
  [
    20,
    (state: FloydWarshallState) => [
      state.update_next(state.i!, state.j!, state.next![get1DIndexFrom(state.i!, state.k!, state.V)]),
      17,
    ],
  ],
  [22, (state: FloydWarshallState) => [state.setIsDone(true)]],
]);
