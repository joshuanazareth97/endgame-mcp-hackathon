import { ITwitterService } from './ITwitterService.js';
import { IWebService } from './IWebService.js';
import { IAnalyticsService } from './IAnalyticsService.js';

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
