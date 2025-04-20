import axios, { AxiosInstance, AxiosError } from 'axios';
import { ConfigManager } from '../config/config.js';
import { Logger } from '../utils/logger.js';
import {
  IMasaApiClient,
  LiveTwitterSearchJob,
  LiveTwitterSearchJobStatus,
  LiveTwitterSearchResultsPage,
  WebScrapeOptions,
  WebScrapeResult,
  SearchTermExtractionResult,
  DataAnalysisResult,
  SimilaritySearchResult,
} from './IMasaApiClient.js';
import { MASA_API_PATHS } from './masaApiClient.constants.js';

/**
 * Implementation of the Masa API Client
 * Provides methods for interacting with Masa API services including Twitter search,
 * web scraping, and AI-powered data analysis
 */
export class MasaApiClient implements IMasaApiClient {
  private apiClient: AxiosInstance;
  private readonly logger = Logger.getInstance();
  private readonly config = ConfigManager.getInstance();
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // ms

  /**
   * Creates a new instance of the Masa API client
   */
  constructor() {
    this.apiClient = axios.create({
      baseURL: this.config.getMasaApiUrl(),
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    this.apiClient.interceptors.request.use(async axiosConfig => {
      const authToken = this.config.getMasaApiKey();
      if (authToken) {
        axiosConfig.headers.Authorization = `Bearer ${authToken}`;
      }

      // Log request details (excluding auth token)
      const sanitizedHeaders = { ...axiosConfig.headers };
      delete sanitizedHeaders.Authorization;

      const requestInfo = {
        url: axiosConfig.url,
        method: axiosConfig.method,
        params: axiosConfig.params,
        headers: sanitizedHeaders,
        data: axiosConfig.data,
      };

      this.logger.info(`[API Request]: ${JSON.stringify(requestInfo)}`);
      return axiosConfig;
    });

    this.apiClient.interceptors.response.use(
      response => {
        const responseInfo = {
          url: response.config.url,
          method: response.config.method,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          responseTime: response.headers['x-response-time'] || 'N/A',
        };

        this.logger.info(`[API Response]: ${JSON.stringify(responseInfo)}`);
        return response;
      },
      (error: AxiosError) => {
        const errorDetails = {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: error.message,
          params: error.config?.params,
          headers: error.config?.headers ? this.sanitizeHeaders(error.config.headers) : undefined,
        };
        this.logger.error(`[API Error]: ${JSON.stringify(errorDetails)}`);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Helper method to execute an API request with retry logic
   * @param requestFn Function that makes the API request
   * @returns Promise resolving to the API response
   * @private
   */
  private async executeWithRetry<T>(requestFn: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as Error;

        // Check if error is worth retrying
        if (error instanceof AxiosError) {
          // Don't retry if it's a client error (4xx) except for 429 (rate limiting)
          const status = error.response?.status;
          if (status && status >= 400 && status < 500 && status !== 429) {
            throw error;
          }
        }

        // If this was the last retry attempt, throw the error
        if (attempt === this.maxRetries) {
          throw error;
        }

        // Log retry attempt
        this.logger.warn(
          `[API Request Failed]: retrying (${attempt}/${this.maxRetries}): ${lastError.message}`
        );

        // Wait before retrying, with exponential backoff
        await new Promise(resolve =>
          setTimeout(resolve, this.retryDelay * Math.pow(2, attempt - 1))
        );
      }
    }

    // This should never happen due to the throw in the loop above, but TypeScript wants it
    throw lastError || new Error('Unknown error during API request');
  }

  /**
   * Sanitizes request headers by removing sensitive information
   * @param headers The headers to sanitize
   * @returns A sanitized copy of the headers
   * @private
   */
  private sanitizeHeaders(headers: Record<string, unknown>): Record<string, unknown> {
    const sanitized = { ...headers };
    // Remove authentication headers
    delete sanitized.Authorization;
    delete sanitized.authorization;
    // Remove any other sensitive headers if needed
    return sanitized;
  }

  /**
   * Initiates a new live Twitter search operation.
   * @param query The search query
   * @param maxResults Maximum number of results to return
   * @returns A promise that resolves to the search job details
   * @throws Error if the search request fails
   */
  async startLiveTwitterSearch(query: string, maxResults: number): Promise<LiveTwitterSearchJob> {
    return this.executeWithRetry(async () => {
      const response = await this.apiClient.post(MASA_API_PATHS.SEARCH_LIVE_TWITTER, {
        query,
        max_results: maxResults,
      });
      return response.data;
    });
  }

  /**
   * Retrieves the current status of a live Twitter search job.
   * @param jobId The ID of the search job
   * @returns A promise that resolves to the current search job status
   * @throws Error if the status request fails
   */
  async getLiveTwitterSearchStatus(jobId: string): Promise<LiveTwitterSearchJobStatus> {
    return this.executeWithRetry(async () => {
      const url = MASA_API_PATHS.SEARCH_LIVE_TWITTER_STATUS.replace('{id}', jobId);
      const response = await this.apiClient.get(url);
      return response.data;
    });
  }

  /**
   * Retrieves the results of a live Twitter search job.
   * @param jobId The ID of the search job
   * @returns A promise that resolves to the search results
   * @throws Error if the results request fails
   */
  async getLiveTwitterSearchResults(jobId: string): Promise<LiveTwitterSearchResultsPage> {
    return this.executeWithRetry(async () => {
      const url = MASA_API_PATHS.SEARCH_LIVE_TWITTER_RESULT.replace('{id}', jobId);
      const response = await this.apiClient.get(url);
      return response.data;
    });
  }

  /**
   * Scrapes a web page and extracts its content.
   * @param url The URL of the web page to scrape
   * @param options Optional scraping options
   * @returns A promise that resolves to the scraped content
   * @throws Error if the scraping request fails
   */
  async scrapeWebsite(url: string, options?: WebScrapeOptions): Promise<WebScrapeResult> {
    return this.executeWithRetry(async () => {
      // Extract format from options if present, as API expects it as a top-level parameter
      const requestBody: Record<string, any> = { url };
      if (options?.format) {
        requestBody.format = options.format;
      }

      const response = await this.apiClient.post(
        MASA_API_PATHS.SEARCH_LIVE_WEB_SCRAPE,
        requestBody
      );
      return response.data;
    });
  }

  /**
   * Extracts optimized search terms from user input using AI.
   * @param userInput The user input to extract search terms from
   * @returns A promise that resolves to the extracted search terms
   * @throws Error if the extraction request fails
   */
  async extractSearchTerms(userInput: string): Promise<SearchTermExtractionResult> {
    return this.executeWithRetry(async () => {
      const response = await this.apiClient.post(MASA_API_PATHS.SEARCH_EXTRACTION, {
        userInput,
      });
      return response.data;
    });
  }

  /**
   * Analyzes tweet data using AI based on a prompt.
   * @param tweets The tweets to analyze (array of strings)
   * @param prompt The analysis prompt
   * @returns A promise that resolves to the analysis result
   * @throws Error if the analysis request fails
   */
  async analyzeData(tweets: string[], prompt: string): Promise<DataAnalysisResult> {
    return this.executeWithRetry(async () => {
      const response = await this.apiClient.post(MASA_API_PATHS.SEARCH_ANALYSIS, {
        tweets,
        prompt,
      });
      return response.data;
    });
  }

  /**
   * Searches Twitter content with similarity matching against keywords.
   * @param query The search query
   * @param keywords Keywords to match against
   * @param maxResults Maximum number of results to return
   * @returns A promise that resolves to the similarity search results
   * @throws Error if the similarity search request fails
   */
  async searchWithSimilarity(
    query: string,
    keywords: string[],
    maxResults: number
  ): Promise<SimilaritySearchResult> {
    return this.executeWithRetry(async () => {
      const response = await this.apiClient.post(MASA_API_PATHS.SEARCH_SIMILARITY_TWITTER, {
        query,
        keywords,
        max_results: maxResults,
      });
      return response.data;
    });
  }
}
