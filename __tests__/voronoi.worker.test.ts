import { generateVoronoiData } from '../lib/math/voronoi';

// Mock the generateVoronoiData to easily test the worker messages
jest.mock('../lib/math/voronoi', () => ({
  generateVoronoiData: jest.fn(),
}));

describe('Voronoi Worker', () => {
  let workerContext: { postMessage: jest.Mock; onmessage?: (e: MessageEvent) => void };
  let originalSelf: unknown;

  beforeEach(() => {
    // Save global self
    originalSelf = (global as unknown as { self: unknown }).self;

    // Mock the worker global context
    workerContext = {
      postMessage: jest.fn(),
    };

    (global as unknown as { self: unknown }).self = workerContext;

    // Require the worker script so it attaches to self.onmessage
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('../lib/math/voronoi.worker.ts');
    });
  });

  afterEach(() => {
    (global as unknown as { self: unknown }).self = originalSelf;
    jest.clearAllMocks();
  });

  it('posts SUCCESS message with polygons when calculation succeeds', () => {
    const mockData = [{ data: { id: 'AAPL' }, polygon: [[0, 0]] }];
    (generateVoronoiData as jest.Mock).mockReturnValue(mockData);

    // Trigger the worker
    workerContext.onmessage!({
      data: {
        etfs: [],
        width: 800,
        height: 600,
        maxNodes: 100,
        cacheKey: 'test-key',
      },
    } as MessageEvent);

    expect(generateVoronoiData).toHaveBeenCalledWith([], 800, 600, 100);
    expect(workerContext.postMessage).toHaveBeenCalledWith({
      type: 'SUCCESS',
      polygons: mockData,
      cacheKey: 'test-key',
    });
  });

  it('posts ERROR message when calculation fails', () => {
    (generateVoronoiData as jest.Mock).mockImplementation(() => {
      throw new Error('Simulation failed');
    });

    workerContext.onmessage!({
      data: { etfs: [] },
    } as MessageEvent);

    expect(workerContext.postMessage).toHaveBeenCalledWith({
      type: 'ERROR',
      error: 'Simulation failed',
    });
  });
});
