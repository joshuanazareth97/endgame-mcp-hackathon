# Model Context Protocol Specification

## Protocol Overview

The Model Context Protocol (MCP) server acts as an API gateway and orchestration layer for the Masa API and related tools. Its primary purpose is to provide a unified interface for executing tools, managing context, and interacting with the Masa API. The MCP server abstracts away direct API calls, handles authentication, and standardizes tool execution, making it easier for clients to integrate with Masa's ecosystem. Typical use cases include tool execution, API request routing, and context-aware operations.

## Core Components

- **API Clients**: Encapsulate communication with the Masa API, handling authentication, request formatting, and response parsing.
- **Service Layer**: Provides a service-oriented architecture with specialized services for Twitter, Web, and Analytics operations.
- **Config**: Manages environment variables and configuration settings, ensuring secure and flexible deployment.
- **Utils**: Utility modules such as logging (Logger), environment management (env), and caching (CacheManager) for consistent diagnostics, configuration, and performance optimization.
- **Tool Registration**: Mechanism for registering and exposing tools that can be invoked via the MCP server.
- **Server Startup**: Entry point for initializing configuration, registering tools, and starting the MCP server process.

## Interfaces

- **IMasaApiClient**: The main TypeScript interface for Masa API clients. Defines methods such as `startLiveTwitterSearch()`, `scrapeWebsite()`, `analyzeData()`, and other API-specific operations.
- **Service Interfaces**:
  - **IBaseService**: Base interface for all services, providing common functionality.
  - **ITwitterService**: Interface for Twitter operations like search, status checking, and similarity matching.
  - **IWebService**: Interface for web scraping and search term extraction.
  - **IAnalyticsService**: Interface for data analysis using AI-based prompts.
  - **IServiceFactory**: Factory interface for creating and managing service instances.
- **MCP Tool Interface**: Each tool implements a standard interface, typically accepting a parameters object and returning a result or error. Tools are registered with metadata describing their name, parameters, and execution logic.

## Data Flow

1. An MCP client invokes a tool via the stdio transport.
2. The MCP server validates the request and extracts parameters.
3. The appropriate tool is executed, which typically:
   - Gets required service instances from the ServiceFactory
   - Uses the services to perform operations
4. The services use the MasaApiClient to interact with the Masa API.
5. The MasaApiClient handles authentication, retry, caching, and error handling, and sends the request to the Masa API.
6. The Masa API responds; the MasaApiClient parses the response and caches it if appropriate.
7. The service processes the response and returns the result to the tool.
8. The tool processes the result and returns it to the MCP server.
9. The MCP server sends the final response (stringified JSON) back to the client.

## Context Management

- **Environment Variables**: Managed via a `.env` file and loaded at startup using the `env` utility.
- **Configuration**: Centralized in the `ConfigManager`, which provides access to all runtime settings.
- **Logging**: All operations are logged using the `Logger` utility for traceability and debugging. Services use contextual logging to add service-specific information.
- **Caching**: API responses are cached using the `CacheManager` with LRU caching and TTL support to improve performance and reduce API calls.

## Service API

The MCP server provides the following service APIs through the ServiceFactory:

### TwitterService

- **searchTweets(query: string, maxResults: number)**: Initiates a new live Twitter search
- **getSearchStatus(jobId: string)**: Retrieves the status of a search job
- **getSearchResults(jobId: string)**: Gets the results of a completed search
- **searchWithSimilarity(query: string, keywords: string[], maxResults: number)**: Searches for tweets with similarity matching

### WebService

- **scrapeWebsite(url: string, options?: WebScrapeOptions)**: Scrapes a web page
- **extractSearchTerms(userInput: string)**: Extracts optimized search terms from user input

### AnalyticsService

- **analyzeData(data: string[], prompt: string)**: Analyzes data using AI based on a prompt

## Integration Guidelines

1. **Docker Usage**: Build and run the MCP server using the provided `Dockerfile` for consistent deployment.
2. **Environment Setup**: Configure required environment variables in a `.env` file (e.g., API keys, endpoints).
3. **Tool Registration**: Add new tools by implementing the standard tool interface and registering them during server startup. Use the ServiceFactory to access services.
4. **API Key Configuration**: Ensure valid Masa API credentials are provided via environment variables or configuration files.
5. **Client Integration**: Clients interact with the MCP server via its API endpoints, invoking tools and receiving standardized responses.
6. **Service Usage**: Tools should access API functionality through the service layer rather than directly using the API client.
