// Check if it's a connection closed errorr';
import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import dotenv from 'dotenv';

import { MasaApiClient } from './apiClients/masaApiClient.js';

// Load environment variables from .env file
dotenv.config();

console.log(`Initializing Masa MCP Server v0.1.0...`);

const server: FastMCP = new FastMCP({
  name: 'Masa MCP',
  version: '0.1.0',
});

// Note: event.session does not have a simple 'sessionId'. Logging the session object.
server.on('connect', event => {
  console.log(`Client connected:`, event.session);
});
server.on('disconnect', event => {
  console.log(`Client disconnected:`, event.session);
});

// TODO: Investigate how to handle tool start/end and specific errors (possibly via session events?)

// Enhanced error handling for connection closed errors and other unhandled rejections
process.on('unhandledRejection', reason => {
  // Check if it's a connection closed error
  if (reason instanceof Error && reason.message?.includes('Connection closed')) {
    console.log('Handled connection closed event:', reason.message);
  } else if (reason && typeof reason === 'object' && 'code' in reason && reason.code === -32000) {
    console.log('Handled MCP connection closed:', reason);
  } else {
    console.error('Unhandled Promise Rejection:', reason);
  }
});

// Add global error handler
process.on('uncaughtException', error => {
  if (
    error.message?.includes('Connection closed') ||
    (error && typeof error === 'object' && 'code' in error && error.code === -32000)
  ) {
    console.log('Handled uncaught connection error:', error.message || error);
  } else {
    console.error('Uncaught Exception:', error);
    // Don't exit for uncaught exceptions - let the server continue running
    // process.exit(1);
  }
});

server.addTool({
  name: 'get_post',
  description: 'Get a details of a post.',
  parameters: z.object({
    id: z.number().describe('The sequential id of the post'),
  }),
  execute: async args => {
    const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${args.id}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch post ${args.id}: ${res.statusText}`);
    }
    const json = await res.json();
    return JSON.stringify(json);
  },
});

server.addTool({
  name: 'start_live_twitter_search',
  description: 'Initiates a new live Twitter search operation.',
  parameters: z.object({
    query: z.string().describe('The search query'),
    maxResults: z.number().describe('Maximum number of results to return'),
  }),
  execute: async args => {
    try {
      const client = new MasaApiClient();
      const result = await client.startLiveTwitterSearch(args.query, args.maxResults);
      return JSON.stringify(result);
    } catch (error) {
      console.error('Error in start_live_twitter_search tool:', error);
      throw error;
    }
  },
});

server.addTool({
  name: 'get_live_twitter_search_status',
  description: 'Retrieves the current status of a live Twitter search job.',
  parameters: z.object({
    jobId: z.string().describe('The ID of the search job'),
  }),
  execute: async args => {
    try {
      const client = new MasaApiClient();
      const result = await client.getLiveTwitterSearchStatus(args.jobId);
      return JSON.stringify(result);
    } catch (error) {
      console.error('Error in get_live_twitter_search_status tool:', error);
      throw error;
    }
  },
});

server.addTool({
  name: 'scrape_website',
  description: 'Parse the contents of a website',
  parameters: z.object({
    url: z.string().describe('The url to scrape'),
  }),
  execute: async args => {
    try {
      // Consider moving sensitive data like API keys to config (Task 3)
      const apiKey = process.env.MASA_API_KEY || ''; // Example: Load from env
      const res = await fetch('https://data.dev.masalabs.ai/api/v1/search/live/web/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          url: args.url,
          format: 'text', // Assuming text format for now
        }),
      });
      if (!res.ok) {
        const errorBody = await res.text();
        console.error(`Scrape API Error (${res.status}): ${errorBody}`);
        throw new Error(`Failed to scrape website ${args.url}: ${res.statusText}`);
      }
      const json = await res.json();
      return JSON.stringify(json);
    } catch (error) {
      console.error('Error in scrape_website tool:', error);
      throw error;
    }
  },
});

server.addTool({
  name: 'get_live_twitter_search_results',
  description: 'Retrieves the results of a live Twitter search job.',
  parameters: z.object({
    jobId: z.string().describe('The ID of the search job'),
  }),
  execute: async args => {
    try {
      const client = new MasaApiClient();
      const result = await client.getLiveTwitterSearchResults(args.jobId);
      return JSON.stringify(result);
    } catch (error) {
      console.error('Error in get_live_twitter_search_results tool:', error);
      throw error;
    }
  },
});

server.addTool({
  name: 'extract_search_terms',
  description: 'Extracts optimized search terms from user input using AI.',
  parameters: z.object({
    userInput: z.string().describe('The user input to extract search terms from'),
  }),
  execute: async args => {
    try {
      const client = new MasaApiClient();
      const result = await client.extractSearchTerms(args.userInput);
      return JSON.stringify(result);
    } catch (error) {
      console.error('Error in extract_search_terms tool:', error);
      throw error;
    }
  },
});

server.addTool({
  name: 'analyze_data',
  description: 'Analyzes tweet data using AI based on a prompt.',
  parameters: z.object({
    tweets: z.array(z.string()).describe('The tweets to analyze (array of strings)'),
    prompt: z.string().describe('The analysis prompt'),
  }),
  execute: async args => {
    try {
      const client = new MasaApiClient();
      const result = await client.analyzeData(args.tweets, args.prompt);
      return JSON.stringify(result);
    } catch (error) {
      console.error('Error in analyze_data tool:', error);
      throw error;
    }
  },
});

server.addTool({
  name: 'search_with_similarity',
  description: 'Searches Twitter content with similarity matching against keywords.',
  parameters: z.object({
    query: z.string().describe('The search query'),
    keywords: z.array(z.string()).describe('Keywords to match against'),
    maxResults: z.number().describe('Maximum number of results to return'),
  }),
  execute: async args => {
    try {
      const client = new MasaApiClient();
      const result = await client.searchWithSimilarity(args.query, args.keywords, args.maxResults);
      return JSON.stringify(result);
    } catch (error) {
      console.error('Error in search_with_similarity tool:', error);
      throw error;
    }
  },
});

// Start the server
server
  .start({
    transportType: 'stdio',
  })
  .then(() => {
    console.log(`🚀 Masa MCP Server running with stdio `);
  })
  .catch((err: Error) => {
    // Explicitly type err
    console.error('🚨 Failed to start MCP server:', err);
    process.exit(1); // Exit if server fails to start
  });

// Graceful shutdown handler
const gracefulShutdown = (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server
    .stop() // Assuming fastmcp has a stop method
    .then(() => {
      console.log('✅ Server stopped.');
      process.exit(0);
    })
    .catch((err: Error) => {
      // Explicitly type err
      console.error('🚨 Error during server shutdown:', err);
      process.exit(1);
    });
  // Force exit if shutdown takes too long
  setTimeout(() => {
    console.error('🚨 Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000); // 10 seconds timeout
};

// Listen for termination signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

console.log('Server setup complete. Waiting for start...');
