import { BaseService } from './BaseService';
import { IWebService } from '../interfaces/IWebService';
import { IMasaApiClient, WebScrapeOptions, WebScrapeResult, SearchTermExtractionResult } from '../../apiClients/IMasaApiClient';
import { CacheManager } from '../../utils/cacheManager';

/**
 * Implementation of the Web service
 */
export class WebService extends BaseService implements IWebService {
  private apiClient: IMasaApiClient;
  private cache: CacheManager;

  constructor(apiClient: IMasaApiClient) {
    super('WebService');
    this.apiClient = apiClient;
    this.cache = CacheManager.getInstance();
  }

  /**
   * Scrapes a web page and extracts its content
   * @param url The URL of the web page to scrape
   * @param options Optional scraping options
   * @returns Promise resolving to the scraped content
   */
  public async scrapeWebsite(url: string, options?: WebScrapeOptions): Promise<WebScrapeResult> {
    const format = options?.format || 'html';
    this.logWithContext('info', `Scraping website: ${url} with format: ${format}`);
    return this.apiClient.scrapeWebsite(url, options);
  }
  
  /**
   * Extracts optimized search terms from user input using AI
   * @param userInput The user input to extract search terms from
   * @returns Promise resolving to the extracted search terms
   */
  public async extractSearchTerms(userInput: string): Promise<SearchTermExtractionResult> {
    this.logWithContext('info', `Extracting search terms from user input`);
    return this.apiClient.extractSearchTerms(userInput);
  }
}