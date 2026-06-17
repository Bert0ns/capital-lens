import { generateVoronoiData } from './voronoi';

self.onmessage = (event: MessageEvent) => {
  const { etfs, width, height, maxNodes } = event.data;

  try {
    const polygons = generateVoronoiData(etfs, width, height, maxNodes);
    self.postMessage({ type: 'SUCCESS', polygons });
  } catch (error) {
    self.postMessage({ type: 'ERROR', error: (error as Error).message });
  }
};
