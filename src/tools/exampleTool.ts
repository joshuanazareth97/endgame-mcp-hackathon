import { ServiceFactory } from '../services/ServiceFactory';

/**
 * Example tool showing how to use the service interfaces
 */
export async function exampleTool(query: string): Promise<any> {
  // Get the service factory instance
  const serviceFactory = ServiceFactory.getInstance();
  
  // Get required services from the factory
  const twitterService = serviceFactory.getTwitterService();
  const analyticsService = serviceFactory.getAnalyticsService();
  
  // Use the Twitter service to search for tweets
  const searchJob = await twitterService.searchTweets(query, 10);
  
  // Get the results
  const results = await twitterService.getSearchResults(searchJob.id);
  
  // Use the Analytics service to analyze the tweets
  const tweets = results.tweets.map(tweet => tweet.text);
  const analysis = await analyticsService.analyzeData(
    tweets,
    `Analyze these tweets about "${query}" and provide key insights`
  );
  
  return {
    query,
    tweetCount: results.tweets.length,
    insights: analysis.result
  };
}