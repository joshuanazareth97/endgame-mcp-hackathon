import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MasaApiClient } from '../../src/apiClients/masaApiClient';

// Properly mock axios.create to return a stable mockAxios instance
vi.mock('axios', async importOriginal => {
  const actual = (await importOriginal()) as any;
  class MockAxiosError extends Error {
    response?: { status?: number };
    constructor(message: string, response?: { status?: number }) {
      super(message);
      this.response = response;
    }
  }
  return {
    ...(actual as any),
    default: {
      ...(actual.default as any),
      create: vi.fn(() => ({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
        post: vi.fn(),
        get: vi.fn(),
      })),
    },
    AxiosError: MockAxiosError,
  };
});

// Mock config and logger
vi.mock('@/config/config.js', () => ({
  ConfigManager: {
    getInstance: () => ({
      getMasaApiUrl: () => 'https://mock.api',
      getMasaApiKey: () => 'mock-api-key',
    }),
  },
}));
vi.mock('@/utils/logger.js', () => ({
  Logger: {
    getInstance: () => ({
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    }),
  },
}));

describe('MasaApiClient', () => {
  let client: MasaApiClient;
  let mockAxios: any;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new MasaApiClient();
    mockAxios = client['apiClient'];
  });

  it('should start a live Twitter search', async () => {
    mockAxios.post.mockResolvedValue({ data: { uuid: '123', status: 'pending' } });
    const result = await client.startLiveTwitterSearch('test', 10);
    expect(result.uuid).toBe('123');
    expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/search/live/twitter', {
      query: 'test',
      max_results: 10,
    });
  });

  it('should get live Twitter search status', async () => {
    mockAxios.get.mockResolvedValue({ data: { jobId: '123', status: 'running' } });
    const result = await client.getLiveTwitterSearchStatus('123');
    expect(result.status).toBe('running');
    expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/search/live/twitter/status/123');
  });

  it('should get live Twitter search results', async () => {
    mockAxios.get.mockResolvedValue({ data: { results: [{ id: '123', text: 'test tweet' }] } });
    const result = await client.getLiveTwitterSearchResults('123');
    expect(result.results).toBeInstanceOf(Array);
    expect(result.results[0].id).toBe('123');
    expect(result.results[0].text).toBe('test tweet');
    expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/search/live/twitter/result/123');
  });

  it('should scrape a website', async () => {
    mockAxios.post.mockResolvedValue({ data: { content: 'scraped' } });
    const result = await client.scrapeWebsite('https://test.com');
    expect(result.content).toBe('scraped');
    expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/search/live/web/scrape', {
      url: 'https://test.com',
    });
  });

  it('should extract search terms', async () => {
    mockAxios.post.mockResolvedValue({ data: { searchTerm: 'a', thinking: 'b' } });
    const result = await client.extractSearchTerms('find this');
    expect(result.searchTerm).toBe('a');
    expect(result.thinking).toBe('b');
    expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/search/extraction', {
      userInput: 'find this',
    });
  });

  it('should analyze data', async () => {
    mockAxios.post.mockResolvedValue({ data: { result: 'result' } });
    const result = await client.analyzeData(['tweet1'], 'analyze');
    expect(result.result).toBe('result');
    expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/search/analysis', {
      tweets: ['tweet1'],
      prompt: 'analyze',
    });
  });

  it('should search with similarity', async () => {
    mockAxios.post.mockResolvedValue({ data: { results: [] } });
    const result = await client.searchWithSimilarity('query', ['kw'], 3);
    expect(result.results).toEqual([]);
    expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/search/similarity/twitter', {
      query: 'query',
      keywords: ['kw'],
      max_results: 3,
    });
  });

  it('should retry on transient errors', async () => {
    const error = new Error('Network error');
    mockAxios.post.mockRejectedValueOnce(error);
    mockAxios.post.mockResolvedValueOnce({ data: { uuid: 'retry' } });
    const result = await client.startLiveTwitterSearch('retry', 1);
    expect(result.uuid).toBe('retry');
    expect(mockAxios.post).toHaveBeenCalledTimes(2);
  });
});
