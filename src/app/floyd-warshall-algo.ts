import { get1DMatrixFrom } from './utils';
import {
  setDist,
  setNext,
  getV,
  set_u,
  get_u,
  set_v,
  get_v,
  updateDist,
  updateNext,
  get_k,
  set_k,
  get_i,
  set_i,
  get_j,
  set_j,
  getDist_ij,
  getNext_ij,
  setIsDone,
} from './floyd-warshall-encoded-state-helpers';

/**
 * Each line of the algorithm is represented by a function that is executed when the line is reached.
 * The function takes in the state, mutates it and returns the next line to execute. If the next line is not
 * specified, the next line is the next line in the algorithm.
 */
export const lines = new Map<
  number,
  (state: DataView, adjacencyMatrix?: readonly (readonly number[])[]) => number | void
>([
  [1, (state: DataView) => undefined],
  [
    2,
    (state: DataView, adjacencyMatrix?: readonly (readonly number[])[]) =>
      setDist(get1DMatrixFrom(adjacencyMatrix!), state),
  ],
  [
    3,
    (state: DataView) =>
      setNext(
        Array.from({ length: getV(state) * getV(state) }, () => null),
        state
      ),
  ],
  [
    4,
    (state: DataView) => {
      let u = get_u(state);
      u = u === undefined ? 0 : u + 1;
      if (u >= getV(state)) {
        set_u(undefined, state);
        return 15;
      }
      set_u(u, state);
      return;
    },
  ],
  [
    5,
    (state: DataView) => {
      let v = get_v(state);
      v = v === undefined ? 0 : v + 1;
      if (v >= getV(state)) {
        set_v(undefined, state);
        return 4;
      }
      set_v(v, state);
      return;
    },
  ],
  [
    6,
    (state: DataView) => {
      if (get_u(state) === get_v(state)) return;
      return 9;
    },
  ],
  [
    7,
    (state: DataView) => {
      const v = get_v(state);
      updateDist(v!, v!, 0, state);
    },
  ],
  [
    8,
    (state: DataView) => {
      const v = get_v(state);
      updateNext(v!, v!, v!, state);
      return 5;
    },
  ],
  [
    9,
    (state: DataView, adjacencyMatrix?: readonly (readonly number[])[]) => {
      if (adjacencyMatrix![get_u(state)!][get_v(state)!] !== 0) return;
      return 12;
    },
  ],
  [
    10,
    (state: DataView) => {
      const v = get_v(state);
      updateNext(get_u(state)!, v!, v!, state);
      return 5;
    },
  ],
  [12, (state: DataView) => updateDist(get_u(state)!, get_v(state)!, 32767, state)],
  [
    13,
    (state: DataView) => {
      updateNext(get_u(state)!, get_v(state)!, null, state);
      return 5;
    },
  ],
  [
    15,
    (state: DataView) => {
      let k = get_k(state);
      k = k === undefined ? 0 : k + 1;
      if (k >= getV(state)) {
        set_k(undefined, state);
        return 22;
      }
      set_k(k, state);
      return;
    },
  ],
  [
    16,
    (state: DataView) => {
      let i = get_i(state);
      i = i === undefined ? 0 : i + 1;
      if (i >= getV(state)) {
        set_i(undefined, state);
        return 15;
      }
      set_i(i, state);
      return;
    },
  ],
  [
    17,
    (state: DataView) => {
      let j = get_j(state);
      j = j === undefined ? 0 : j + 1;
      if (j >= getV(state)) {
        set_j(undefined, state);
        return 16;
      }
      set_j(j, state);
      return;
    },
  ],
  [
    18,
    (state: DataView) => {
      const i = get_i(state)!;
      const j = get_j(state)!;
      const k = get_k(state)!;
      if (getDist_ij(i, j, state) > getDist_ij(i, k, state) + getDist_ij(k, j, state)) return;
      return 17;
    },
  ],
  [
    19,
    (state: DataView) => {
      const i = get_i(state)!;
      const j = get_j(state)!;
      const k = get_k(state)!;
      const newDistance = getDist_ij(i, k, state) + getDist_ij(k, j, state);
      updateDist(i, j, newDistance, state);
    },
  ],
  [
    20,
    (state: DataView) => {
      const i = get_i(state)!;
      const j = get_j(state)!;
      const k = get_k(state)!;
      const newNext = getNext_ij(i, k, state);
      updateNext(i, j, newNext, state);
      return 17;
    },
  ],
  [
    22,
    (state: DataView) => {
      setIsDone(true, state);
    },
  ],
]);
