# Implementation Guide

## Architecture

### Project Structure

``` bash
masa-mcp/
├── src/                        # Main source code, organized by feature
│   ├── apiClients/             # Masa API client interfaces and implementations
│   ├── config/                 # Project configuration logic
│   ├── services/               # Service layer with interfaces and implementations
│   │   ├── interfaces/         # Service interfaces
│   │   ├── implementations/    # Service implementations
│   │   └── ServiceFactory.ts   # Factory for creating service instances
│   ├── tools/                  # MCP Tool Executors
│   ├── utils/                  # Utility modules (environment, logging, caching)
│   └── index.ts                # Main entry point for the library
├── tests/                      # Unit tests, mirrors src/ structure
│   ├── apiClients/             # Tests for API clients
│   ├── ServiceFactory.test.ts  # Tests for service factory
│   ├── config.test.ts          # Tests for config logic
│   ├── index.test.ts           # Tests for main entry point
│   └── logger.test.ts          # Tests for logger utility
├── docs/                       # Documentation
│   ├── IMPLEMENTATION.md
│   └── SPECIFICATION.md
├── package.json                
├── tsconfig.json              
├── vitest.config.ts            
└── Dockerfile                 
```


## Components

- **apiClients/**: Contains Masa API client interfaces and implementations ([IMasaApiClient.ts](../src/apiClients/IMasaApiClient.ts), [masaApiClient.ts](../src/apiClients/masaApiClient.ts)).
- **config/**: Project configuration logic ([config.ts](../src/config/config.ts)).
- **services/**: Service layer with interfaces and implementations:
  - **ServiceFactory.ts**: Singleton factory for creating and managing service instances ([ServiceFactory.ts](../src/services/ServiceFactory.ts))
  - **interfaces/**: Service interfaces:
    - **IBaseService.ts**: Base interface for all services ([IBaseService.ts](../src/services/interfaces/IBaseService.ts))
    - **ITwitterService.ts**: Interface for Twitter operations ([ITwitterService.ts](../src/services/interfaces/ITwitterService.ts))
    - **IWebService.ts**: Interface for web scraping and search ([IWebService.ts](../src/services/interfaces/IWebService.ts))
    - **IAnalyticsService.ts**: Interface for data analysis ([IAnalyticsService.ts](../src/services/interfaces/IAnalyticsService.ts))
    - **IServiceFactory.ts**: Interface for service factory ([IServiceFactory.ts](../src/services/interfaces/IServiceFactory.ts))
  - **implementations/**: Service implementations:
    - **BaseService.ts**: Base implementation with common logging ([BaseService.ts](../src/services/implementations/BaseService.ts))
    - **TwitterService.ts**: Twitter service implementation ([TwitterService.ts](../src/services/implementations/TwitterService.ts))
    - **WebService.ts**: Web service implementation ([WebService.ts](../src/services/implementations/WebService.ts))
    - **AnalyticsService.ts**: Analytics service implementation ([AnalyticsService.ts](../src/services/implementations/AnalyticsService.ts))
- **tools/**: MCP Tool Executors, demonstrating service usage ([exampleTool.ts](../src/tools/exampleTool.ts)).
- **utils/**: Utility modules for environment, logging, and caching ([env.ts](../src/utils/env.ts), [logger.ts](../src/utils/logger.ts), [cacheManager.ts](../src/utils/cacheManager.ts)).
- **index.ts**: Main entry point for the library ([index.ts](../src/index.ts)).
- **resources/**: Present as placeholder for future expansion.

## Setup

For development :

1. Ensure Node.js (22) is installed.
2. Install dependencies with `yarn install`.
3. Build the project with `yarn build` or `yarn build:watch` for continuous builds.
4. Run tests with `yarn test` or `yarn test:watch` for continuous testing.
5. Use `yarn lint` to check code style and `yarn format` to auto-format code.

## Usage

### Prerequisites
0. Docker, an API key from [masa.dev](https://masa.dev), and an MCP Client of your choice.
1. Clone the repository:

```bash
git clone <repository-url>
```

2. Navigate to the folder and build the Docker image:

```bash
cd masa-realtime-mcp
docker build -t masa-mcp-server:latest .
```

### Claude Desktop

To use this server with Claude Desktop add the following configuration to the "mcpServers" section of your claude_desktop_config.json:

```json
{
  "mcpServers": {
    "masa-realtime-data": {
      "command": "docker",
      "args": [
          "run",
          "--rm",
          "-i",
          "-e",
          "MASA_API_KEY=<your API key>",
          "-e",
          "MASA_API_URL=https://data.dev.masalabs.ai",
          "masa-mcp-server:latest"
        ]
      }
    }
}
```

### VS Code, Cursor, Windsurf etc

To use this server with VS Code, Cursor, Windsurf, or similar IDEs, add the following configuration to the respective settings file (`.cursor/mcp.json` or `.vscode/mcp.json`):

```json
{
  "servers": {
    "masa-realtime-data": {
      "command": "docker",
      "args": [
          "run",
          "--rm",
          "-i",
          "-e",
          "MASA_API_KEY=<your API key>",
          "-e",
          "MASA_API_URL=https://data.dev.masalabs.ai",
          "masa-mcp-server:latest"
        ]
      }
    }
}
```

## Performance

Standard TypeScript performance with the following optimizations:
- Service instances are created only once (lazy initialization via Singleton pattern)
- API responses are cached using the CacheManager with LRU caching and TTL support
- Logging includes contextual information from services for better debugging

## Service Layer Architecture

The project implements a service-oriented architecture with the following key patterns:

### Singleton Factory Pattern

The `ServiceFactory` class follows the Singleton pattern to ensure only one instance exists throughout the application:

```typescript
// Get the service factory instance
const serviceFactory = ServiceFactory.getInstance();

// Get required services
const twitterService = serviceFactory.getTwitterService();
const webService = serviceFactory.getWebService();
const analyticsService = serviceFactory.getAnalyticsService();
```

### Dependency Injection

Services receive their dependencies (like the API client) through constructor injection:

```typescript
constructor(apiClient: IMasaApiClient) {
  super('TwitterService');
  this.apiClient = apiClient;
  this.cache = CacheManager.getInstance();
}
```

### Integration with CacheManager

Services use the `CacheManager` for caching API responses to improve performance.


## Testing

- Unit tests are located in the `tests/` directory, mirroring the source structure.
- Testing is performed using [Vitest](https://vitest.dev/).
- Run all tests with `yarn test`.
- Test coverage:
  - API client
  - ServiceFactory
  - Service implementations
  - Config
  - Utilities (Logger, CacheManager)
