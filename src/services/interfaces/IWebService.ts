import { IBaseService } from './IBaseService';
import {
  WebScrapeOptions,
  WebScrapeResult,
  SearchTermExtractionResult
} from '../../apiClients/IMasaApiClient';

/**
 * Service interface for web-related operations
 */
export interface IWebService extends IBaseService {
  /**
   * Scrapes a web page and extracts its content
   * @param url The URL of the web page to scrape
   * @param options Optional scraping options
   * @returns Promise resolving to the scraped content
   */
  scrapeWebsite(url: string, options?: WebScrapeOptions): Promise<WebScrapeResult>;
  
  /**
   * Extracts optimized search terms from user input using AI
   * @param userInput The user input to extract search terms from
   * @returns Promise resolving to the extracted search terms
   */
  extractSearchTerms(userInput: string): Promise<SearchTermExtractionResult>;
}