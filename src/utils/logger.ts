// filepath: /home/joshua/development/endgame_hackathon/masa-mcp/src/utils/logger.ts

/**
 * A simple logger class that wraps console.log with timestamps
 * Implemented using the Singleton pattern
 */
export class Logger {
  private static instance: Logger;

  /**
   * Private constructor to prevent direct instantiation
   */
  private constructor() {}

  /**
   * Get the singleton instance of Logger
   * @returns The Logger instance
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Logs a message with the current timestamp
   * @param message The message to log
   * @param args Additional arguments to log
   */
  public log(message: any, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}]`, message, ...args);
  }

  /**
   * Logs an error message with the current timestamp
   * @param message The error message to log
   * @param args Additional arguments to log
   */
  public error(message: any, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}]`, message, ...args);
  }

  /**
   * Logs a warning message with the current timestamp
   * @param message The warning message to log
   * @param args Additional arguments to log
   */
  public warn(message: any, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}]`, message, ...args);
  }

  /**
   * Logs an info message with the current timestamp
   * @param message The info message to log
   * @param args Additional arguments to log
   */
  public info(message: any, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    console.info(`[${timestamp}]`, message, ...args);
  }
}
