# Masa MCP Server

## Overview

The Masa Model Context Protocol (MCP) server provides real-time data access for AI models through a standardized interface. This implementation serves as a bridge between AI applications and Masa's data ecosystem, focusing on three key domains:

- **Twitter data**: Live search, status monitoring, and trend analysis
- **Web content**: Website scraping and search term optimization
- **Data analytics**: AI-powered analysis of collected data

The server is designed for easy integration with Claude Desktop, VS Code Copilot, Cursor, and other AI assistants via the Model Context Protocol.

## What is MCP?

MCP ensures models evolve beyond static training data by:
- Providing standardized access to contextual data
- Enabling real-time data integration
- Supporting dynamic context management
- Facilitating transparent decision processes

## What is Subnet 42?

Masa Subnet 42 is a decentralized data layer for AI agents and applications, featuring:
- Real-time data pipelines
- Decentralized storage solutions
- Enterprise time series capabilities
- Vector store functionality

## Key Features

- **Real-time Twitter analysis**: Search Twitter for trends, track conversations, and analyze sentiment in real-time
- **Web scraping and content extraction**: Fetch and process web content from any URL
- **Optimized search term generation**: Automatically extract optimal search terms from user queries
- **Modular tool architecture**: Domain-specific tools organized by functionality
- **Efficient caching with LRU and TTL**: Improved performance with intelligent response caching
- **Comprehensive logging**: Structured JSON logging with configurable log levels
- **Docker-ready deployment**: Simple containerized setup for any environment

## Available Tools

### Twitter Tools

- `start_live_twitter_search`: Begin a new Twitter search with customizable parameters
- `get_live_twitter_search_status`: Check the status of an ongoing Twitter search
- `get_live_twitter_search_results`: Retrieve results from a completed search
- `search_tweets_with_similarity`: Find tweets with similarity matching against keywords

### Web Tools

- `scrape_website`: Extract content from any web page with configurable options
- `extract_search_terms`: Generate optimized search terms from natural language input

### Analytics Tools

- `analyze_data`: Process datasets with AI-powered analysis using custom prompts

## Quick Start

To get started quickly, pull the pre-built Docker image from Docker Hub:

```bash
docker pull joshuanazareth/masa-mcp-server:latest
```

Then run the server with your API key:

```bash
docker run --rm -i -e MASA_API_KEY=<your API key> -e MASA_API_URL=https://data.dev.masalabs.ai joshunazareth/masa-mcp-server:latest
```

## Integration

The server integrates with various AI development environments:

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "masa-realtime-data": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "-e", "MASA_API_KEY=<your API key>",
        "-e", "MASA_API_URL=https://data.dev.masalabs.ai",
        "masa-mcp-server:latest"
      ]
    }
  }
}
```

### VS Code / Cursor / Windsurf

Add to `.vscode/mcp.json` or `.cursor/mcp.json`:

```json
{
  "servers": {
    "masa-realtime-data": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "-e", "MASA_API_KEY=<your API key>",
        "-e", "MASA_API_URL=https://data.dev.masalabs.ai",
        "masa-mcp-server:latest"
      ]
    }
  }
}
```

## Development

1. Install Node.js 22
2. Run `yarn install`
3. Build with `yarn build` or `yarn build:watch`
4. Test with `yarn test` or `yarn test:watch`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.