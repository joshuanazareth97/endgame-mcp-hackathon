import { z } from 'zod';
import { Logger } from '../utils/logger.js';
import { ServiceFactory } from '../services/ServiceFactory.js';

const logger = Logger.getInstance();

export const TwitterTools = {
  start_live_twitter_search: {
    name: 'start_live_twitter_search',
    description: 'Initiates a new search on twitter for tweets matching a certain query.',
    parameters: z.object({
      query: z.string().describe('The search query'),
      maxResults: z.number().describe('Maximum number of results to return'),
    }),
    execute: async (args: { query: string; maxResults: number }) => {
      try {
        const twitterService = ServiceFactory.getInstance().getTwitterService();
        const result = await twitterService.searchTweets(args.query, args.maxResults);
        return JSON.stringify(result);
      } catch (error) {
        logger.error('[start_live_twitter_search][ERR]', error);
        throw error;
      }
    },
  },

  get_live_twitter_search_status: {
    name: 'get_live_twitter_search_status',
    description: 'Retrieves the current status of a live Twitter search job.',
    parameters: z.object({
      jobId: z.string().describe('The ID of the search job'),
    }),
    execute: async (args: { jobId: string }) => {
      try {
        const twitterService = ServiceFactory.getInstance().getTwitterService();
        const result = await twitterService.getSearchStatus(args.jobId);
        return JSON.stringify(result);
      } catch (error) {
        logger.error('[get_live_twitter_search_status][ERR]', error);
        throw error;
      }
    },
  },

  get_live_twitter_search_results: {
    name: 'get_live_twitter_search_results',
    description: 'Retrieves the results of a live Twitter search job.',
    parameters: z.object({
      jobId: z.string().describe('The ID of the search job'),
    }),
    execute: async (args: { jobId: string }) => {
      try {
        const twitterService = ServiceFactory.getInstance().getTwitterService();
        const result = await twitterService.getSearchResults(args.jobId);
        return JSON.stringify(result);
      } catch (error) {
        logger.error('[get_live_twitter_search_results][ERR]', error);
        throw error;
      }
    },
  },

  search_with_similarity: {
    name: 'search_with_similarity',
    description: 'Searches Twitter content with similarity matching against keywords.',
    parameters: z.object({
      query: z.string().describe('The search query'),
      keywords: z.array(z.string()).describe('Keywords to match against'),
      maxResults: z.number().describe('Maximum number of results to return'),
    }),
    execute: async (args: { query: string; keywords: string[]; maxResults: number }) => {
      try {
        const twitterService = ServiceFactory.getInstance().getTwitterService();
        const result = await twitterService.searchWithSimilarity(args.query, args.keywords, args.maxResults);
        return JSON.stringify(result);
      } catch (error) {
        logger.error('[search_with_similarity][ERR]', error);
        throw error;
      }
    },
  },
};