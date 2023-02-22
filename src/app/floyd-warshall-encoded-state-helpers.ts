import { get1DIndexFrom } from './utils';

const INT16_BYTES = 2;

const CURRENT_STEP_OFFSET = 0;
const CURRENT_LINE_OFFSET = 4;
const IS_DONE_OFFSET = 5;
const V_OFFSET = 6;
const u_OFFSET = 8;
const v_OFFSET = 10;
const k_OFFSET = 12;
const i_OFFSET = 14;
const j_OFFSET = 16;
const DIST_OFFSET = 18;

export function make(adjacencyMatrix: readonly (readonly number[])[]): DataView {
  const V = adjacencyMatrix.length;
  const distByteSize = V ** 2 * INT16_BYTES;
  const nextByteSize = V ** 2 * INT16_BYTES;
  const bufferSize = DIST_OFFSET + distByteSize + nextByteSize;
  const buffer = new ArrayBuffer(bufferSize);
  const view = new DataView(buffer);

  // Set initial values
  setCurrentStep(0, view);
  setCurrentLine(1, view);
  setIsDone(false, view);
  setV(V, view);
  set_u(undefined, view);
  set_v(undefined, view);
  set_k(undefined, view);
  set_i(undefined, view);
  set_j(undefined, view);
  setDist(undefined, view);
  setNext(undefined, view);

  return view;
}

export function getCurrentStep(view: DataView): number {
  return view.getUint32(CURRENT_STEP_OFFSET);
}

export function setCurrentStep(currentStep: number, view: DataView): void {
  view.setUint32(CURRENT_STEP_OFFSET, currentStep);
}

export function getCurrentLine(view: DataView): number {
  return view.getUint8(CURRENT_LINE_OFFSET);
}

export function setCurrentLine(currentLine: number, view: DataView): void {
  view.setUint8(CURRENT_LINE_OFFSET, currentLine);
}

export function getIsDone(view: DataView): boolean {
  return view.getUint8(IS_DONE_OFFSET) === 1;
}

export function setIsDone(isDone: boolean, view: DataView): void {
  view.setUint8(IS_DONE_OFFSET, isDone ? 1 : 0);
}

export function getV(view: DataView): number {
  return view.getUint16(V_OFFSET);
}

export function setV(V: number, view: DataView): void {
  view.setUint16(V_OFFSET, V);
}

export function get_u(view: DataView): number | undefined {
  const u = view.getInt16(u_OFFSET);
  return u === -1 ? undefined : u;
}

export function set_u(u: number | undefined, view: DataView): void {
  view.setInt16(u_OFFSET, u === undefined ? -1 : u);
}

export function get_v(view: DataView): number | undefined {
  const v = view.getInt16(v_OFFSET);
  return v === -1 ? undefined : v;
}

export function set_v(v: number | undefined, view: DataView): void {
  view.setInt16(v_OFFSET, v === undefined ? -1 : v);
}

export function get_k(view: DataView): number | undefined {
  const k = view.getInt16(k_OFFSET);
  return k === -1 ? undefined : k;
}

export function set_k(k: number | undefined, view: DataView): void {
  view.setInt16(k_OFFSET, k === undefined ? -1 : k);
}

export function get_i(view: DataView): number | undefined {
  const i = view.getInt16(i_OFFSET);
  return i === -1 ? undefined : i;
}

export function set_i(i: number | undefined, view: DataView): void {
  view.setInt16(i_OFFSET, i === undefined ? -1 : i);
}

export function get_j(view: DataView): number | undefined {
  const j = view.getInt16(j_OFFSET);
  return j === -1 ? undefined : j;
}

export function set_j(j: number | undefined, view: DataView): void {
  view.setInt16(j_OFFSET, j === undefined ? -1 : j);
}

export function getDist(view: DataView): number[] | undefined {
  const hasDist = view.getInt16(DIST_OFFSET) >= 0;
  if (!hasDist) return undefined;

  const V = getV(view);
  const dist = new Array(V ** 2);
  for (let i = 0; i < V ** 2; i++) {
    dist[i] = view.getInt16(DIST_OFFSET + INT16_BYTES * i);
  }
  return dist;
}

export function getDist_ij(i: number, j: number, view: DataView): number {
  const V = getV(view);
  const index = get1DIndexFrom(i, j, V);
  return view.getInt16(DIST_OFFSET + INT16_BYTES * index);
}

export function setDist(dist: number[] | undefined, view: DataView): void {
  if (dist === undefined) {
    view.setInt16(DIST_OFFSET, -1);
    return;
  }

  for (let i = 0; i < dist.length; i++) {
    view.setInt16(DIST_OFFSET + INT16_BYTES * i, dist[i]);
  }
}

export function updateDist(i: number, j: number, value: number, view: DataView): void {
  const V = getV(view);
  const index = get1DIndexFrom(i, j, V);
  const offset = DIST_OFFSET + INT16_BYTES * index;
  view.setInt16(offset, value);
}

export function getNext(view: DataView): (number | null)[] | undefined {
  const V = getV(view);
  const nextOffset = getNextOffset(V);
  const hasNext = view.getInt16(nextOffset) >= -1;
  if (!hasNext) return undefined;

  const next = new Array(V ** 2);
  for (let i = 0; i < V ** 2; i++) {
    const value = view.getInt16(nextOffset + INT16_BYTES * i);
    next[i] = value === -1 ? null : value;
  }

  return next;
}

export function getNext_ij(i: number, j: number, view: DataView): number | null {
  const V = getV(view);
  const index = get1DIndexFrom(i, j, V);
  const nextOffset = getNextOffset(V);
  const value = view.getInt16(nextOffset + INT16_BYTES * index);
  return value === -1 ? null : value;
}

export function setNext(next: (number | null)[] | undefined, view: DataView): void {
  const V = getV(view);
  const nextOffset = getNextOffset(V);
  if (next === undefined) {
    view.setInt16(nextOffset, -2);
    return;
  }

  for (let i = 0; i < next.length; i++) {
    view.setInt16(nextOffset + INT16_BYTES * i, next[i] === null ? -1 : (next[i] as number));
  }
}

export function updateNext(i: number, j: number, value: number | null, view: DataView): void {
  const V = getV(view);
  const index = get1DIndexFrom(i, j, V);
  const offset = getNextOffset(V) + INT16_BYTES * index;
  view.setInt16(offset, value === null ? -1 : value);
}

function getNextOffset(V: number): number {
  return DIST_OFFSET + V ** 2 * INT16_BYTES;
}

export function stateSizeInBytes(adjacencyMatrixLength: number): number {
  const distMatrixSizeInBytes = adjacencyMatrixLength ** 2 * INT16_BYTES;
  const nextMatrixSizeInBytes = adjacencyMatrixLength ** 2 * INT16_BYTES;
  return DIST_OFFSET + distMatrixSizeInBytes + nextMatrixSizeInBytes;
}

