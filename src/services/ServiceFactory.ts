import { IServiceFactory } from './interfaces/IServiceFactory';
import { ITwitterService } from './interfaces/ITwitterService';
import { IWebService } from './interfaces/IWebService';
import { IAnalyticsService } from './interfaces/IAnalyticsService';
import { TwitterService } from './implementations/TwitterService';
import { WebService } from './implementations/WebService';
import { AnalyticsService } from './implementations/AnalyticsService';
import { IMasaApiClient } from '../apiClients/IMasaApiClient';
import { MasaApiClient } from '../apiClients/masaApiClient';
import { Logger } from '../utils/logger';

/**
 * Factory for creating and managing service instances
 * Implements the Singleton pattern
 */
export class ServiceFactory implements IServiceFactory {
  private static instance: ServiceFactory;
  private readonly logger = Logger.getInstance();
  
  private twitterService: ITwitterService | null = null;
  private webService: IWebService | null = null;
  private analyticsService: IAnalyticsService | null = null;
  
  private apiClient: IMasaApiClient;

  /**
   * Private constructor to prevent direct instantiation
   */
  private constructor() {
    this.apiClient = new MasaApiClient();
    this.logger.info('ServiceFactory initialized');
  }

  /**
   * Gets the singleton instance of ServiceFactory
   */
  public static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }

  /**
   * Gets or creates a Twitter service instance
   */
  public getTwitterService(): ITwitterService {
    if (!this.twitterService) {
      this.twitterService = new TwitterService(this.apiClient);
      this.logger.debug('TwitterService instance created');
    }
    return this.twitterService;
  }
  
  /**
   * Gets or creates a Web service instance
   */
  public getWebService(): IWebService {
    if (!this.webService) {
      this.webService = new WebService(this.apiClient);
      this.logger.debug('WebService instance created');
    }
    return this.webService;
  }
  
  /**
   * Gets or creates an Analytics service instance
   */
  public getAnalyticsService(): IAnalyticsService {
    if (!this.analyticsService) {
      this.analyticsService = new AnalyticsService(this.apiClient);
      this.logger.debug('AnalyticsService instance created');
    }
    return this.analyticsService;
  }
  
  /**
   * Gets the API client instance (for internal use)
   */
  public getApiClient(): IMasaApiClient {
    return this.apiClient;
  }
  
  /**
   * Sets a custom API client (for testing)
   */
  public setApiClient(client: IMasaApiClient): void {
    this.apiClient = client;
    // Reset all services to null to ensure they'll be recreated with the new client
    this.twitterService = null;
    this.webService = null;
    this.analyticsService = null;
    this.logger.debug('API client replaced and services reset');
  }
}