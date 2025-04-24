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
   * Maps string log levels to numeric priorities
   */
  private getLogLevel(): number {
    const level = (process.env.LOG_LEVEL || 'INFO').toUpperCase();
    const mapping: Record<string, number> = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };
    return mapping[level] ?? mapping.INFO;
  }

  /**
   * Determines if a message at the given level should be logged
   */
  private shouldLog(level: number): boolean {
    return this.getLogLevel() >= level;
  }

  /**
   * Logs a debug-level message (alias for log)
   */
  public log(message: any, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    if (this.isDebugEnabled() && this.shouldLog(3)) {
      if (process.env.LOG_FORMAT === 'json') {
        const payload = {
          timestamp,
          level: 'DEBUG',
          message,
          metadata: args.length > 0 ? args[0] : null,
        };
        console.log(JSON.stringify(payload));
      } else {
        console.log(`[${timestamp}]`, message, ...args);
      }
    }
  }

  /**
   * Debug-level logs
   */
  public debug(message: any, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    if (this.isDebugEnabled() && this.shouldLog(3)) {
      if (process.env.LOG_FORMAT === 'json') {
        const payload = {
          timestamp,
          level: 'DEBUG',
          message,
          metadata: args.length > 0 ? args[0] : null,
        };
        console.log(JSON.stringify(payload));
      } else {
        console.debug(`[${timestamp}]`, message, ...args);
      }
    }
  }

  /**
   * Logs an info message with the current timestamp
   */
  public info(message: any, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    if (this.isDebugEnabled() && this.shouldLog(2)) {
      if (process.env.LOG_FORMAT === 'json') {
        const payload = {
          timestamp,
          level: 'INFO',
          message,
          metadata: args.length > 0 ? args[0] : null,
        };
        console.log(JSON.stringify(payload));
      } else {
        console.info(`[${timestamp}]`, message, ...args);
      }
    }
  }

  /**
   * Logs a warning message with the current timestamp
   */
  public warn(message: any, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    if (this.isDebugEnabled() && this.shouldLog(1)) {
      if (process.env.LOG_FORMAT === 'json') {
        const payload = {
          timestamp,
          level: 'WARN',
          message,
          metadata: args.length > 0 ? args[0] : null,
        };
        console.log(JSON.stringify(payload));
      } else {
        console.warn(`[${timestamp}]`, message, ...args);
      }
    }
  }

  /**
   * Logs an error message with the current timestamp
   */
  public error(message: any, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    if (this.isDebugEnabled() && this.shouldLog(0)) {
      if (process.env.LOG_FORMAT === 'json') {
        const payload = {
          timestamp,
          level: 'ERROR',
          message,
          metadata: args.length > 0 ? args[0] : null,
        };
        console.log(JSON.stringify(payload));
      } else {
        console.error(`[${timestamp}]`, message, ...args);
      }
    }
  }

  /**
   * Check if debug is enabled
   */
  private isDebugEnabled(): boolean {
    return process.env.DEBUG === 'true';
  }
}
