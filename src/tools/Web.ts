import { z } from 'zod';
import { Logger } from '../utils/logger.js';
import { ServiceFactory } from '../services/ServiceFactory.js';

const logger = Logger.getInstance();

export const WebTools = {
  scrape_website: {
    name: 'scrape_website',
    description: 'Retrieve the contents from a web URL and parse them into the specified format.',
    parameters: z.object({
      url: z.string().describe('The url to scrape'),
      format: z.enum(['html', 'markdown', 'text']).describe('The format to parse the content into'),
    }),
    execute: async (args: { url: string; format: 'html' | 'markdown' | 'text' }) => {
      try {
        const webService = ServiceFactory.getInstance().getWebService();
        const result = await webService.scrapeWebsite(args.url, {
          format: args.format,
        });
        return JSON.stringify(result);
      } catch (error) {
        logger.error('[scrape_website][ERR]', error);
        throw error;
      }
    },
  },
};
