import { ITwitterService } from './ITwitterService';
import { IWebService } from './IWebService';
import { IAnalyticsService } from './IAnalyticsService';

/**
 * Factory interface for creating service instances
 */
export interface IServiceFactory {
  /**
   * Gets or creates a Twitter service instance
   */
  getTwitterService(): ITwitterService;
  
  /**
   * Gets or creates a Web service instance
   */
  getWebService(): IWebService;
  
  /**
   * Gets or creates an Analytics service instance
   */
  getAnalyticsService(): IAnalyticsService;
}
