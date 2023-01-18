/// <reference lib="webworker" />

import { MAX_CHECKPOINTS } from './constants';
import { lines } from './floyd-warshall-algo';
import { FloydWarshallState, FloydWarshallStateDto } from './floyd-warshall.state';
import { estimateNumberOfStates } from './utils';

addEventListener('message', ({ data }: { data: FloydWarshallStateDto }) => {
  const estimatedNumberOfStates = estimateNumberOfStates(data.adjacencyMatrix);
  const checkPointSize = Math.max(1, Math.ceil(estimatedNumberOfStates / MAX_CHECKPOINTS));
  let index = 0;
  let state: FloydWarshallState = FloydWarshallState.from(data);

  while (!state.isDone) {
    const instruction = lines.get(state.currentLine)!;
    const [newState = state, nextLine = state.currentLine + 1] = instruction(state);
    state = newState.setCurrentLine(nextLine);
    index++;
    const isCheckPoint = index % checkPointSize === 0;
    if (isCheckPoint) {
      postMessage({index,...state});
    }
  }

  self.close();
});
