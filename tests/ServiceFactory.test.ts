import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServiceFactory } from '../src/services/ServiceFactory';
import { ITwitterService } from '../src/services/interfaces/ITwitterService';
import { IWebService } from '../src/services/interfaces/IWebService';
import { IAnalyticsService } from '../src/services/interfaces/IAnalyticsService';
import { IMasaApiClient } from '../src/apiClients/IMasaApiClient';

// Create a mock API client
const mockApiClient: IMasaApiClient = {
  startLiveTwitterSearch: vi.fn(),
  getLiveTwitterSearchStatus: vi.fn(),
  getLiveTwitterSearchResults: vi.fn(),
  scrapeWebsite: vi.fn(),
  extractSearchTerms: vi.fn(),
  analyzeData: vi.fn(),
  searchWithSimilarity: vi.fn()
};

describe('ServiceFactory', () => {
  beforeEach(() => {
    // Reset the ServiceFactory instance between tests by replacing the API client
    // This forces it to create new service instances
    ServiceFactory.getInstance().setApiClient(mockApiClient);
    
    // Reset all mocks
    vi.resetAllMocks();
  });

  it('should return the same instance when getInstance is called multiple times', () => {
    const instance1 = ServiceFactory.getInstance();
    const instance2 = ServiceFactory.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should create and return a TwitterService instance', () => {
    const factory = ServiceFactory.getInstance();
    const twitterService = factory.getTwitterService();
    
    expect(twitterService).toBeDefined();
    expect(twitterService.getServiceName()).toBe('TwitterService');
  });

  it('should create and return a WebService instance', () => {
    const factory = ServiceFactory.getInstance();
    const webService = factory.getWebService();
    
    expect(webService).toBeDefined();
    expect(webService.getServiceName()).toBe('WebService');
  });

  it('should create and return an AnalyticsService instance', () => {
    const factory = ServiceFactory.getInstance();
    const analyticsService = factory.getAnalyticsService();
    
    expect(analyticsService).toBeDefined();
    expect(analyticsService.getServiceName()).toBe('AnalyticsService');
  });

  it('should return the same service instance on subsequent calls', () => {
    const factory = ServiceFactory.getInstance();
    const twitterService1 = factory.getTwitterService();
    const twitterService2 = factory.getTwitterService();
    
    expect(twitterService1).toBe(twitterService2);
  });

  it('should use the injected API client for service operations', async () => {
    const factory = ServiceFactory.getInstance();
    const twitterService = factory.getTwitterService();
    
    await twitterService.searchTweets('test query', 10);
    
    expect(mockApiClient.startLiveTwitterSearch).toHaveBeenCalledWith('test query', 10);
  });

  it('should reset service instances when API client is changed', () => {
    const factory = ServiceFactory.getInstance();
    const twitterService1 = factory.getTwitterService();
    
    // Change the API client
    factory.setApiClient({...mockApiClient});
    
    const twitterService2 = factory.getTwitterService();
    
    expect(twitterService1).not.toBe(twitterService2);
  });
});