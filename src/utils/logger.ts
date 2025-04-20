/**
 * Logger class that adds timestamps to console output
 * Implements the Singleton pattern
 */
export class Logger {
  private static instance: Logger;

  /**
   * Private constructor to prevent direct instantiation
   */
  private constructor() {}

  /**
   * Returns the singleton instance of Logger
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Checks if debug mode is enabled via environment variable
   * @returns boolean True if DEBUG=true, false otherwise
   */
  private isDebugEnabled(): boolean {
    return process.env.DEBUG === 'true';
  }

  /**
   * Logs a message with the current timestamp
   * @param message The message to log
   * @param args Additional arguments to log
   */
  public log(message: any, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    if (this.isDebugEnabled()) {
      console.log(`[${timestamp}]`, message, ...args);
    }
  }

  /**
   * Logs an error message with the current timestamp
   * @param message The error message to log
   * @param args Additional arguments to log
   */
  public error(message: any, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    if (this.isDebugEnabled()) {
      console.error(`[${timestamp}]`, message, ...args);
    }
  }

  /**
   * Logs a warning message with the current timestamp
   * @param message The warning message to log
   * @param args Additional arguments to log
   */
  public warn(message: any, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    if (this.isDebugEnabled()) {
      console.warn(`[${timestamp}]`, message, ...args);
    }
  }

  /**
   * Logs an info message with the current timestamp
   * @param message The info message to log
   * @param args Additional arguments to log
   */
  public info(message: any, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    if (this.isDebugEnabled()) {
      console.info(`[${timestamp}]`, message, ...args);
    }
  }
}
