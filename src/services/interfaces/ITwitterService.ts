import { IBaseService } from './IBaseService';
import {
  LiveTwitterSearchJob,
  LiveTwitterSearchJobStatus,
  LiveTwitterSearchResultsPage,
  SimilaritySearchResult
} from '../../apiClients/IMasaApiClient';

/**
 * Service interface for Twitter-related operations
 */
export interface ITwitterService extends IBaseService {
  /**
   * Initiates a new live Twitter search operation
   * @param query The search query
   * @param maxResults Maximum number of results to return
   * @returns Promise resolving to the search job details
   */
  searchTweets(query: string, maxResults: number): Promise<LiveTwitterSearchJob>;

  /**
   * Retrieves the current status of a live Twitter search job
   * @param jobId The ID of the search job
   * @returns Promise resolving to the current search job status
   */
  getSearchStatus(jobId: string): Promise<LiveTwitterSearchJobStatus>;

  /**
   * Retrieves the results of a live Twitter search job
   * @param jobId The ID of the search job
   * @returns Promise resolving to the search results
   */
  getSearchResults(jobId: string): Promise<LiveTwitterSearchResultsPage>;

  /**
   * Searches Twitter content with similarity matching against keywords
   * @param query The search query
   * @param keywords Keywords to match against
   * @param maxResults Maximum number of results to return
   * @returns Promise resolving to the similarity search results
   */
  searchWithSimilarity(query: string, keywords: string[], maxResults: number): Promise<SimilaritySearchResult>;
}
