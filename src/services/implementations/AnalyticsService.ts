import { BaseService } from './BaseService.js';
import { IAnalyticsService } from '../interfaces/IAnalyticsService.js';
import { IMasaApiClient, DataAnalysisResult } from '../../apiClients/IMasaApiClient.js';
import { CacheManager } from '../../utils/cacheManager.js';

/**
 * Implementation of the Analytics service
 */
export class AnalyticsService extends BaseService implements IAnalyticsService {
  private apiClient: IMasaApiClient;
  private cache: CacheManager;

  constructor(apiClient: IMasaApiClient) {
    super('AnalyticsService');
    this.apiClient = apiClient;
    this.cache = CacheManager.getInstance();
  }

  /**
   * Analyzes data using AI based on a prompt
   * @param data The data to analyze (array of strings)
   * @param prompt The analysis prompt
   * @returns Promise resolving to the analysis result
   */
  public async analyzeData(data: string[], prompt: string): Promise<DataAnalysisResult> {
    this.logWithContext(
      'info',
      `Analyzing ${data.length} data items with prompt: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"`
    );
    return this.apiClient.analyzeData(data, prompt);
  }
}
