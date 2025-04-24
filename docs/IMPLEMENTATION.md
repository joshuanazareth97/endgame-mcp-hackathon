# Implementation Guide

## Architecture

### Project Structure

``` bash
masa-mcp/
├── src/                        # Main source code, organized by feature
│   ├── apiClients/             # Masa API client interfaces and implementations
│   ├── config/                 # Project configuration logic
│   ├── utils/                  # Utility modules (environment, logging)
│   ├── tools/                  # MCP Tool Executors
│   └── index.ts                # Main entry point for the library
├── tests/                      # Unit tests, mirrors src/ structure
│   ├── apiClients/             # Tests for API clients
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
- **utils/**: Utility modules for environment and logging ([env.ts](../src/utils/env.ts), [logger.ts](../src/utils/logger.ts)).
- **index.ts**: Main entry point for the library ([index.ts](../src/index.ts)).
- **resources/**, **services/**, **tools/**: Present as placeholders for future expansion.

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

Standard TypeScript performance; no explicit performance optimizations or bottlenecks identified in the current implementation.

## Testing

- Unit tests are located in the `tests/` directory, mirroring the source structure.
- Testing is performed using [Vitest](https://vitest.dev/).
- Run all tests with `yarn test`.
- Test coverage:
  - API client
  - config
  - utilities
