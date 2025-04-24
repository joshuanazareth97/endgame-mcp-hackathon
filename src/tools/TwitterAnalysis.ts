import { z } from 'zod';
import { Logger } from '../utils/logger.js';
import { ServiceFactory } from '../services/ServiceFactory.js';

const logger = Logger.getInstance();

export const TwitterAnalysisTools = {
  extract_search_terms: {
    name: 'extract_search_terms',
    description: 'Extracts optimized search terms from user input using AI.',
    parameters: z.object({
      userInput: z.string().describe('The user input to extract search terms from'),
    }),
    execute: async (args: { userInput: string }) => {
      try {
        const webService = ServiceFactory.getInstance().getWebService();
        const result = await webService.extractSearchTerms(args.userInput);
        return JSON.stringify(result);
      } catch (error) {
        logger.error('[extract_search_terms][ERR]', error);
        throw error;
      }
    },
  },

  analyze_data: {
    name: 'analyze_data',
    description: 'Analyzes tweet data using AI based on a prompt.',
    parameters: z.object({
      tweets: z.array(z.string()).describe('The tweets to analyze (array of strings)'),
      prompt: z.string().describe('The analysis prompt'),
    }),
    execute: async (args: { tweets: string[]; prompt: string }) => {
      try {
        const analyticsService = ServiceFactory.getInstance().getAnalyticsService();
        const result = await analyticsService.analyzeData(args.tweets, args.prompt);
        return JSON.stringify(result);
      } catch (error) {
        logger.error('[analyze_data][ERR]', error);
        throw error;
      }
    },
  },
};