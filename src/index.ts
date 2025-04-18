import { FastMCP } from "fastmcp";
import { z } from "zod";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const PORT = process.env.MCP_PORT ? parseInt(process.env.MCP_PORT, 10) : 8080;
const SSE_ENDPOINT: `/${string}` = process.env.MCP_SSE_ENDPOINT?.startsWith("/")
  ? (process.env.MCP_SSE_ENDPOINT as `/${string}`)
  : "/sse";

console.log(`Initializing Masa MCP Server v0.1.0...`);

const server: FastMCP = new FastMCP({
  name: "Masa MCP",
  version: "0.1.0",
});

// Note: event.session does not have a simple 'sessionId'. Logging the session object.
server.on("connect", (event) => {
  console.log(`Client connected:`, event.session);
});
server.on("disconnect", (event) => {
  console.log(`Client disconnected:`, event.session);
});

// TODO: Investigate how to handle tool start/end and specific errors (possibly via session events?)

// Enhanced error handling for connection closed errors and other unhandled rejections
process.on("unhandledRejection", (reason, promise) => {
  // Check if it's a connection closed error
  if (
    reason instanceof Error &&
    reason.message?.includes("Connection closed")
  ) {
    console.log("Handled connection closed event:", reason.message);
  } else if (
    reason &&
    typeof reason === "object" &&
    "code" in reason &&
    reason.code === -32000
  ) {
    console.log("Handled MCP connection closed:", reason);
  } else {
    console.error("Unhandled Promise Rejection:", reason);
  }
});

// Add global error handler
process.on("uncaughtException", (error) => {
  if (
    error.message?.includes("Connection closed") ||
    (error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === -32000)
  ) {
    console.log("Handled uncaught connection error:", error.message || error);
  } else {
    console.error("Uncaught Exception:", error);
    // Don't exit for uncaught exceptions - let the server continue running
    // process.exit(1);
  }
});

server.addTool({
  name: "get_post",
  description: "Get a details of a post.",
  parameters: z.object({
    id: z.number().describe("The sequential id of the post"),
  }),
  execute: async (args) => {
    // @ts-ignore - Assuming fetch is available globally or polyfilled
    const res = await fetch(
      `https://jsonplaceholder.typicode.com/posts/${args.id}`
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch post ${args.id}: ${res.statusText}`);
    }
    const json = await res.json();
    return JSON.stringify(json);
  },
});

server.addTool({
  name: "scrape_website",
  description: "Parse the contents of a website",
  parameters: z.object({
    url: z.string().describe("The url to scrape"),
  }),
  execute: async (args) => {
    try {
      // @ts-ignore - Assuming fetch is available globally or polyfilled
      // Consider moving sensitive data like API keys to config (Task 3)
      const apiKey =
        process.env.MASA_API_KEY ||
        "iVyer8MZ7rWvbK6m3VctzHJsNdu7IZKkgff6i9QdNRhhpQ95"; // Example: Load from env
      const res = await fetch(
        "https://data.dev.masalabs.ai/api/v1/search/live/web/scrape",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            url: args.url,
            format: "text", // Assuming text format for now
          }),
        }
      );
      if (!res.ok) {
        const errorBody = await res.text();
        console.error(`Scrape API Error (${res.status}): ${errorBody}`);
        throw new Error(
          `Failed to scrape website ${args.url}: ${res.statusText}`
        );
      }
      const json = await res.json();
      return JSON.stringify(json);
    } catch (error) {
      console.error("Error in scrape_website tool:", error);
      throw error;
    }
  },
});

// Start the server
server
  .start({
    transportType: "sse",
    sse: {
      endpoint: SSE_ENDPOINT,
      port: PORT,
    },
  })
  .then(() => {
    console.log(
      `🚀 MCP Server running on port ${PORT}, SSE endpoint at ${SSE_ENDPOINT}`
    );
  })
  .catch((err: Error) => {
    // Explicitly type err
    console.error("🚨 Failed to start MCP server:", err);
    process.exit(1); // Exit if server fails to start
  });

// Graceful shutdown handler
const gracefulShutdown = (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server
    .stop() // Assuming fastmcp has a stop method
    .then(() => {
      console.log("✅ Server stopped.");
      process.exit(0);
    })
    .catch((err: Error) => {
      // Explicitly type err
      console.error("🚨 Error during server shutdown:", err);
      process.exit(1);
    });
  // Force exit if shutdown takes too long
  setTimeout(() => {
    console.error(
      "🚨 Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 10000); // 10 seconds timeout
};

// Listen for termination signals
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

console.log("Server setup complete. Waiting for start...");
