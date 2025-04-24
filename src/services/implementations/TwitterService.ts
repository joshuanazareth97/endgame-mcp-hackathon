import { BaseService } from './BaseService';
import { ITwitterService } from '../interfaces/ITwitterService';
import { IMasaApiClient, LiveTwitterSearchJob, LiveTwitterSearchJobStatus, LiveTwitterSearchResultsPage, SimilaritySearchResult } from '../../apiClients/IMasaApiClient';
import { CacheManager } from '../../utils/cacheManager';

/**
 * Implementation of the Twitter service
 */
export class TwitterService extends BaseService implements ITwitterService {
  private apiClient: IMasaApiClient;
  private cache: CacheManager;

  constructor(apiClient: IMasaApiClient) {
    super('TwitterService');
    this.apiClient = apiClient;
    this.cache = CacheManager.getInstance();
  }

  /**
   * Initiates a new live Twitter search operation
   * @param query The search query
   * @param maxResults Maximum number of results to return
   * @returns Promise resolving to the search job details
   */
  public async searchTweets(query: string, maxResults: number): Promise<LiveTwitterSearchJob> {
    this.logWithContext('info', `Starting Twitter search for query: "${query}" with maxResults: ${maxResults}`);
    return this.apiClient.startLiveTwitterSearch(query, maxResults);
  }

  /**
   * Retrieves the current status of a live Twitter search job
   * @param jobId The ID of the search job
   * @returns Promise resolving to the current search job status
   */
  public async getSearchStatus(jobId: string): Promise<LiveTwitterSearchJobStatus> {
    this.logWithContext('debug', `Getting status for search job: ${jobId}`);
    return this.apiClient.getLiveTwitterSearchStatus(jobId);
  }

  /**
   * Retrieves the results of a live Twitter search job
   * @param jobId The ID of the search job
   * @returns Promise resolving to the search results
   */
  public async getSearchResults(jobId: string): Promise<LiveTwitterSearchResultsPage> {
    this.logWithContext('debug', `Getting results for search job: ${jobId}`);
    return this.apiClient.getLiveTwitterSearchResults(jobId);
  }

  /**
   * Searches Twitter content with similarity matching against keywords
   * @param query The search query
   * @param keywords Keywords to match against
   * @param maxResults Maximum number of results to return
   * @returns Promise resolving to the similarity search results
   */
  public async searchWithSimilarity(
    query: string, 
    keywords: string[], 
    maxResults: number
  ): Promise<SimilaritySearchResult> {
    this.logWithContext('info', `Starting similarity search with query: "${query}" and ${keywords.length} keywords`);
    return this.apiClient.searchWithSimilarity(query, keywords, maxResults);
  }
}