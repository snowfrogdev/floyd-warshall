/// <reference lib="webworker" />

import { lines } from './floyd-warshall-algo';
import { FloydWarshallState, FloydWarshallStateDto } from './floyd-warshall.state';

addEventListener('message', ({ data }: { data: FloydWarshallStateDto }) => {
  let state: FloydWarshallState = FloydWarshallState.from(data);
  while (!state.isDone) {
    const instruction = lines.get(state.currentLine)!;
    const [newState = state, nextLine = state.currentLine + 1] = instruction(state);
    state = newState.setCurrentLine(nextLine);
    postMessage(state);
  }
  self.close();
});
