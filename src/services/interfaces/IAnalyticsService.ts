import { IBaseService } from './IBaseService.js';
import { DataAnalysisResult } from '../../apiClients/IMasaApiClient.js';

/**
 * Service interface for analytics and data processing operations
 */
export interface IAnalyticsService extends IBaseService {
  /**
   * Analyzes data using AI based on a prompt
   * @param data The data to analyze (array of strings)
   * @param prompt The analysis prompt
   * @returns Promise resolving to the analysis result
   */
  analyzeData(data: string[], prompt: string): Promise<DataAnalysisResult>;
}
