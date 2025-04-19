import { z } from 'zod';
import { loadEnvironment } from '@/utils/env.js';
// import { Logger } from '@/utils/logger.js';

// Define schema for environment variables
export const envSchema = z.object({
  MASA_API_KEY: z.string().trim().min(1, 'MASA_API_KEY is required'),

  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  MASA_API_URL: z
    .string()
    .url('MASA_API_URL must be a valid URL')
    .default('https://api.masa.xyz/v1'),

  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

// Type for the validated config
export type Config = z.infer<typeof envSchema>;

/**
 * ConfigManager class responsible for loading, validating and providing access to
 * environment configuration variables.
 *
 * This class follows the Singleton pattern to ensure only one instance exists.
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: Config;

  private constructor() {
    loadEnvironment();
    this.config = this.validateEnvironment();
  }

  /**
   * Returns the singleton instance of ConfigManager
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Validates environment variables against schema
   * @returns Validated configuration object
   */
  private validateEnvironment(): Config {
    try {
      const config = envSchema.parse(process.env);
      // Using info level for successful validation
      // const logger = Logger.getDefault();
      // logger.info('Environment configuration validated successfully');
      return config;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error(
          'Environment configuration validation failed:',
          error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        );
      }
      throw error;
    }
  }

  /**
   * Returns the complete configuration object
   */
  public getConfig(): Config {
    return this.config;
  }

  /**
   * Returns the Masa API key
   */
  public getMasaApiKey(): string {
    return this.config?.MASA_API_KEY ?? '';
  }

  /**
   * Returns the Masa API URL
   */
  public getMasaApiUrl(): string {
    return this.config.MASA_API_URL;
  }

  /**
   * Checks if the application is running in production mode
   */
  public isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  /**
   * Checks if the application is running in development mode
   */
  public isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  /**
   * Checks if the application is running in test mode
   */
  public isTest(): boolean {
    return this.config.NODE_ENV === 'test';
  }
}
