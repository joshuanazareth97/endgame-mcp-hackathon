/**
 * Interface defining the contract for interacting with the Masa API.
 * This interface provides methods for authentication and live Twitter search operations.
 */
export interface IMasaApiClient {
  /**
   * Initiates a new live Twitter search operation.
   * @param query The search query
   * @param maxResults Maximum number of results to return
   * @returns A promise that resolves to the search job details
   * @throws Error if the search request fails
   */
  startLiveTwitterSearch(query: string, maxResults: number): Promise<LiveTwitterSearchJob>;

  /**
   * Retrieves the current status of a live Twitter search job.
   * @param jobId The ID of the search job
   * @returns A promise that resolves to the current search job status
   * @throws Error if the status request fails
   */
  getLiveTwitterSearchStatus(jobId: string): Promise<LiveTwitterSearchJobStatus>;

  /**
   * Retrieves the results of a live Twitter search job.
   * @param jobId The ID of the search job
   * @returns A promise that resolves to the search results
   * @throws Error if the results request fails
   */
  getLiveTwitterSearchResults(jobId: string): Promise<LiveTwitterSearchResultsPage>;

  /**
   * Scrapes a web page and extracts its content.
   * @param url The URL of the web page to scrape
   * @param options Optional scraping options
   * @returns A promise that resolves to the scraped content
   * @throws Error if the scraping request fails
   */
  scrapeWebsite(url: string, options?: WebScrapeOptions): Promise<WebScrapeResult>;

  /**
   * Extracts optimized search terms from user input using AI.
   * @param userInput The user input to extract search terms from
   * @returns A promise that resolves to the extracted search terms
   * @throws Error if the extraction request fails
   */
  extractSearchTerms(userInput: string): Promise<SearchTermExtractionResult>;

  /**
   * Analyzes tweet data using AI based on a prompt.
   * @param tweets The tweets to analyze (array of strings)
   * @param prompt The analysis prompt
   * @returns A promise that resolves to the analysis result
   * @throws Error if the analysis request fails
   */
  analyzeData(tweets: string[], prompt: string): Promise<DataAnalysisResult>;

  /**
   * Searches Twitter content with similarity matching against keywords.
   * @param query The search query
   * @param keywords Keywords to match against
   * @param maxResults Maximum number of results to return
   * @returns A promise that resolves to the similarity search results
   * @throws Error if the similarity search request fails
   */
  searchWithSimilarity(
    query: string,
    keywords: string[],
    maxResults: number
  ): Promise<SimilaritySearchResult>;
}

/**
 * Represents a live Twitter search job.
 */
export interface LiveTwitterSearchJob {
  /**
   * Job UUID for tracking
   */
  uuid: string;
}

/**
 * Detailed status of a live Twitter search job.
 */
export interface LiveTwitterSearchJobStatus {
  /**
   * Current status of the search job
   */
  status: LiveTwitterSearchJobStatusType;
}

/**
 * A single tweet result from a live Twitter search.
 */
export interface Tweet {
  /**
   * Unique identifier for the tweet
   */
  id: string;

  /**
   * The tweet content
   */
  text: string;
}

/**
 * A result of tweets from a live Twitter search.
 */
export interface LiveTwitterSearchResultsPage {
  /**
   * Array of results in this response
   */
  results: {
    /**
     * Unique identifier for the tweet
     */
    id: string;

    /**
     * The tweet content
     */
    text: string;
  }[];
}

/**
 * Options for website scraping.
 */
export interface WebScrapeOptions {
  /**
   * Format to return the scraped content in
   */
  format?: 'text' | 'html' | 'markdown';
}

/**
 * Result of a website scraping operation.
 */
export interface WebScrapeResult {
  /**
   * URL that was scraped
   */
  url: string;

  /**
   * Title of the webpage
   */
  title: string;

  /**
   * Main content of the webpage in the requested format
   */
  content: string;

  /**
   * Metadata extracted from the webpage
   */
  metadata: Record<string, any>;
}

/**
 * Result from extracting search terms using AI.
 */
export interface SearchTermExtractionResult {
  /**
   * The extracted and optimized search term
   */
  searchTerm: string;

  /**
   * The AI's reasoning process for extraction
   */
  thinking: string;
}

/**
 * Result from analyzing data with AI.
 */
export interface DataAnalysisResult {
  /**
   * The analysis result
   */
  result: string;
}

/**
 * Result from a similarity search operation.
 */
export interface SimilaritySearchResult {
  /**
   * Array of search results
   */
  results: {
    /**
     * Unique identifier for the result
     */
    id: string;

    /**
     * Result text content
     */
    text: string;

    /**
     * Similarity score (0-1, where 1 is exact match)
     */
    similarity: number;
  }[];
}

/**
 * Status type enumeration for Twitter search jobs
 */
export type LiveTwitterSearchJobStatusType = 'in_progress';
