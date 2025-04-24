// Check if it's a connection closed errorr';
import dotenv from 'dotenv';
import { FastMCP } from 'fastmcp';
import { TwitterAnalysisTools, TwitterTools, WebTools } from './tools/index.js';
import { Logger } from './utils/logger.js';

// Load environment variables from .env file
dotenv.config();

const logger = Logger.getInstance();

logger.log(`Initializing Masa MCP Server v0.1.0...`);

const server: FastMCP = new FastMCP({
  name: 'Masa MCP',
  version: '0.1.0',
});

// Note: event.session does not have a simple 'sessionId'. Logging the session object.
server.on('connect', event => {
  logger.log(`Client connected:`, event.session);
});
server.on('disconnect', event => {
  logger.log(`Client disconnected:`, event.session);
});

// Enhanced error handling for connection closed errors and other unhandled rejections
process.on('unhandledRejection', reason => {
  // Check if it's a connection closed error
  if (reason instanceof Error && reason.message?.includes('Connection closed')) {
    logger.log('Handled connection closed event:', reason.message);
  } else if (reason && typeof reason === 'object' && 'code' in reason && reason.code === -32000) {
    logger.log('Handled MCP connection closed:', reason);
  } else {
    logger.error('Unhandled Promise Rejection:', reason);
  }
});

// Add global error handler
process.on('uncaughtException', error => {
  if (
    error.message?.includes('Connection closed') ||
    (error && typeof error === 'object' && 'code' in error && error.code === -32000)
  ) {
    logger.log('Handled uncaught connection error:', error.message || error);
  } else {
    logger.error('Uncaught Exception:', error);
  }
});

// Add Twitter tools
server.addTool(TwitterTools.start_live_twitter_search);
server.addTool(TwitterTools.get_live_twitter_search_status);
server.addTool(TwitterTools.get_live_twitter_search_results);
server.addTool(TwitterTools.search_with_similarity);

// Add Twitter analysis tools
server.addTool(TwitterAnalysisTools.extract_search_terms);
server.addTool(TwitterAnalysisTools.analyze_data);

// Add Web tools
server.addTool(WebTools.scrape_website);

// Start the server
server
  .start({
    transportType: 'stdio',
  })
  .then(() => {
    logger.log(`🚀 Masa MCP Server running with stdio `);
  })
  .catch((err: Error) => {
    // Explicitly type err
    logger.error('🚨 Failed to start MCP server:', err);
    process.exit(1); // Exit if server fails to start
  });

// Graceful shutdown handler
const gracefulShutdown = (signal: string) => {
  logger.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server
    .stop() // Assuming fastmcp has a stop method
    .then(() => {
      logger.log('✅ Server stopped.');
      process.exit(0);
    })
    .catch((err: Error) => {
      // Explicitly type err
      logger.error('🚨 Error during server shutdown:', err);
      process.exit(1);
    });
  // Force exit if shutdown takes too long
  setTimeout(() => {
    logger.error('🚨 Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000); // 10 seconds timeout
};

// Listen for termination signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

logger.log('Server setup complete. Waiting for start...');
