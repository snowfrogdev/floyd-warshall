/// <reference lib="webworker" />

import { MAX_CHECKPOINTS } from './constants';
import { lines } from './floyd-warshall-algo';
import {
  getCurrentLine,
  getCurrentStep,
  getIsDone,
  setCurrentLine,
  setCurrentStep,
} from './floyd-warshall-encoded-state-helpers';
import { InitialDto } from './initial-dto';
import { estimateNumberOfStates } from './utils';
import * as floydWasm from 'floyd-wasm';

addEventListener('message', ({ data }: { data: InitialDto }) => {
  const estimatedNumberOfStates = estimateNumberOfStates(data.adjacencyMatrix.length);
  const checkPointSize = Math.max(1, Math.ceil(estimatedNumberOfStates / MAX_CHECKPOINTS));
  //let state: DataView = new DataView(data.state);
  floydWasm.run(data.adjacencyMatrix as any[], checkPointSize);
  /* while (!getIsDone(state)) {
    const currentLine = getCurrentLine(state);
    const instruction = lines.get(currentLine)!;
    const nextLine: number = instruction(state, data.adjacencyMatrix) ?? currentLine + 1;
    setCurrentLine(nextLine, state);
    const step = getCurrentStep(state) + 1;
    setCurrentStep(step, state);
    const isCheckPoint = step % checkPointSize === 0;
    if (isCheckPoint) {
      const copy = state.buffer.slice(0);
      postMessage(copy, [copy]);
    }
  }

  const copy = state.buffer.slice(0);
  postMessage(copy, [copy]);
  self.close(); */
});
