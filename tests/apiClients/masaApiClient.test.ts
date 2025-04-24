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

// Mock CacheManager for testing cache behavior
const mockCache = {
  get: vi.fn(),
  set: vi.fn(),
};
vi.mock('@/utils/cacheManager.js', () => ({
  CacheManager: {
    getInstance: () => mockCache,
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

describe('MasaApiClient cache functionality', () => {
  let client: MasaApiClient;
  let mockAxios: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCache.get.mockReset();
    mockCache.set.mockReset();
    client = new MasaApiClient();
    mockAxios = client['apiClient'];
  });

  it('should return cached live twitter results and not call API', async () => {
    const jobId = 'cachedJob';
    const cachedValue = { results: [{ id: '1', text: 'cached' }] };
    mockCache.get.mockReturnValueOnce(cachedValue);

    const result = await client.getLiveTwitterSearchResults(jobId);
    expect(result).toBe(cachedValue);
    expect(mockAxios.get).not.toHaveBeenCalled();
  });

  it('should fetch and cache live twitter results on miss', async () => {
    const jobId = 'newJob';
    mockCache.get.mockReturnValueOnce(undefined);
    const data = { results: [{ id: '2', text: 'fresh' }] };
    mockAxios.get.mockResolvedValue({ data });

    const result = await client.getLiveTwitterSearchResults(jobId);
    expect(result).toEqual(data);
    expect(mockCache.set).toHaveBeenCalledWith('twitter', `liveTwitterResults-${jobId}`, data);
  });

  it('should return cached scrape result and not call API', async () => {
    const url = 'https://cached.com';
    const cachedValue = { content: 'cached' };
    mockCache.get.mockReturnValueOnce(cachedValue);

    const result = await client.scrapeWebsite(url);
    expect(result).toBe(cachedValue);
    expect(mockAxios.post).not.toHaveBeenCalled();
  });

  it('should fetch and cache scrape result on miss', async () => {
    const url = 'https://fresh.com';
    mockCache.get.mockReturnValueOnce(undefined);
    const data = { content: 'fresh' };
    mockAxios.post.mockResolvedValue({ data });

    const result = await client.scrapeWebsite(url);
    expect(result).toEqual(data);
    expect(mockCache.set).toHaveBeenCalledWith('scrape', `scrape-html-${url}`, data);
  });

  it('should return cached extracted search terms and not call API', async () => {
    const input = 'cached input';
    const cachedValue = { searchTerm: 'a', thinking: 'b' };
    mockCache.get.mockReturnValueOnce(cachedValue);

    const result = await client.extractSearchTerms(input);
    expect(result).toBe(cachedValue);
    expect(mockAxios.post).not.toHaveBeenCalled();
  });

  it('should fetch and cache extracted search terms on miss', async () => {
    const input = 'fresh input';
    mockCache.get.mockReturnValueOnce(undefined);
    const data = { searchTerm: 'x', thinking: 'y' };
    mockAxios.post.mockResolvedValue({ data });

    const result = await client.extractSearchTerms(input);
    expect(result).toEqual(data);
    expect(mockCache.set).toHaveBeenCalledWith('extract', `extractSearchTerms-${input}`, data);
  });

  it('should return cached analysis result and not call API', async () => {
    const tweets = ['t1'];
    const prompt = 'p';
    const cachedValue = { result: 'cached' };
    mockCache.get.mockReturnValueOnce(cachedValue);

    const result = await client.analyzeData(tweets, prompt);
    expect(result).toBe(cachedValue);
    expect(mockAxios.post).not.toHaveBeenCalled();
  });

  it('should fetch and cache analysis result on miss', async () => {
    const tweets = ['t2'];
    const prompt = 'q';
    const _cacheKey = JSON.stringify({ tweets, prompt });
    mockCache.get.mockReturnValueOnce(undefined);
    const data = { result: 'fresh' };
    mockAxios.post.mockResolvedValue({ data });

    const result = await client.analyzeData(tweets, prompt);
    expect(result).toEqual(data);
    expect(mockCache.set).toHaveBeenCalledWith('analysis', `analyzeData-${_cacheKey}`, data);
  });

  it('should return cached similarity result and not call API', async () => {
    const query = 'q';
    const keywords = ['k'];
    const maxResults = 5;
    const cachedValue = { results: [] };
    mockCache.get.mockReturnValueOnce(cachedValue);

    const result = await client.searchWithSimilarity(query, keywords, maxResults);
    expect(result).toBe(cachedValue);
    expect(mockAxios.post).not.toHaveBeenCalled();
  });

  it('should fetch and cache similarity result on miss', async () => {
    const query = 'q2';
    const keywords = ['k2'];
    const maxResults = 3;
    const _cacheKey = JSON.stringify({ query, keywords, maxResults });
    mockCache.get.mockReturnValueOnce(undefined);
    const data = { results: ['fresh'] };
    mockAxios.post.mockResolvedValue({ data });

    const result = await client.searchWithSimilarity(query, keywords, maxResults);
    expect(result).toEqual(data);
    expect(mockCache.set).toHaveBeenCalledWith('similarity', `similarity-${_cacheKey}`, data);
  });
});
