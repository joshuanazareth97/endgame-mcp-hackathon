import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { envSchema, ConfigManager } from '../src/config/config';
import { ZodError } from 'zod';

describe('Configuration Module', () => {
  const ORIGINAL_ENV = { ...process.env };

  // Used to access private state for testing
  const resetSingleton = () => {
    // @ts-expect-error - Accessing private property for testing
    ConfigManager['instance'] = undefined;
  };

  beforeEach(() => {
    // Start with a clean environment for each test
    process.env = {};
    resetSingleton();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original environment after each test
    process.env = { ...ORIGINAL_ENV };
    vi.restoreAllMocks();
    resetSingleton();
  });

  describe('Schema validation', () => {
    it('parses MASA_API_KEY correctly', () => {
      const testEnv = { MASA_API_KEY: 'test-key' };
      const parsed = envSchema.parse(testEnv);
      expect(parsed.MASA_API_KEY).toBe('test-key');
    });

    it('throws if MASA_API_KEY is missing', () => {
      const testEnv = {};
      expect(() => envSchema.parse(testEnv)).toThrow();
    });

    it('applies default values correctly', () => {
      const testEnv = { MASA_API_KEY: 'test-key' };
      const parsed = envSchema.parse(testEnv);
      expect(parsed.NODE_ENV).toBe('development');
      expect(parsed.MASA_API_URL).toBe('https://api.masa.xyz/v1');
      expect(parsed.LOG_LEVEL).toBe('info');
    });

    it('validates NODE_ENV enum values', () => {
      const testEnv = { MASA_API_KEY: 'test-key', NODE_ENV: 'production' };
      const parsed = envSchema.parse(testEnv);
      expect(parsed.NODE_ENV).toBe('production');

      const invalidTestEnv = { MASA_API_KEY: 'test-key', NODE_ENV: 'invalid' };
      expect(() => envSchema.parse(invalidTestEnv)).toThrow();
    });

    it('validates MASA_API_URL as a valid URL', () => {
      const testEnv = {
        MASA_API_KEY: 'test-key',
        MASA_API_URL: 'https://custom-api.com',
      };
      const parsed = envSchema.parse(testEnv);
      expect(parsed.MASA_API_URL).toBe('https://custom-api.com');

      const invalidTestEnv = {
        MASA_API_KEY: 'test-key',
        MASA_API_URL: 'not-a-url',
      };
      expect(() => envSchema.parse(invalidTestEnv)).toThrow();
    });

    it('validates LOG_LEVEL enum values', () => {
      const testEnv = { MASA_API_KEY: 'test-key', LOG_LEVEL: 'error' };
      const parsed = envSchema.parse(testEnv);
      expect(parsed.LOG_LEVEL).toBe('error');

      const testEnv2 = { MASA_API_KEY: 'test-key', LOG_LEVEL: 'warn' };
      const parsed2 = envSchema.parse(testEnv2);
      expect(parsed2.LOG_LEVEL).toBe('warn');

      const testEnv3 = { MASA_API_KEY: 'test-key', LOG_LEVEL: 'debug' };
      const parsed3 = envSchema.parse(testEnv3);
      expect(parsed3.LOG_LEVEL).toBe('debug');

      const invalidTestEnv = { MASA_API_KEY: 'test-key', LOG_LEVEL: 'invalid' };
      expect(() => envSchema.parse(invalidTestEnv)).toThrow();
    });

    it('rejects empty strings for required fields', () => {
      const testEnv = { MASA_API_KEY: '' };
      expect(() => envSchema.parse(testEnv)).toThrow();
    });

    it('rejects whitespace-only strings for required fields', () => {
      const testEnv = { MASA_API_KEY: '   ' };
      expect(() => envSchema.parse(testEnv)).toThrow();
    });
  });

  describe('ConfigManager singleton', () => {
    it('creates a singleton instance', () => {
      const instance1 = ConfigManager.getInstance();
      const instance2 = ConfigManager.getInstance();

      expect(instance1).toBeDefined();
      expect(instance1).toBe(instance2);
    });

    it('exits process on validation failure', () => {
      process.env.MASA_API_KEY = '';
      expect(() => {
        ConfigManager.getInstance();
      }).toThrow(ZodError);
    });

    it('validates and accesses configuration correctly', () => {
      // Set a valid test environment
      process.env.MASA_API_KEY = 'test-instance-key';
      process.env.NODE_ENV = 'production';
      process.env.MASA_API_URL = 'https://test.api.com';
      process.env.LOG_LEVEL = 'debug';

      const instance = ConfigManager.getInstance();

      // Test direct instance methods
      expect(instance.getConfig().MASA_API_KEY).toBe('test-instance-key');
      expect(instance.getMasaApiKey()).toBe('test-instance-key');
      expect(instance.getMasaApiUrl()).toBe('https://test.api.com');
      expect(instance.isProduction()).toBe(true);
      expect(instance.isDevelopment()).toBe(false);
      expect(instance.isTest()).toBe(false);
    });

    it('handles non-Zod errors during validation', () => {
      // Create a scenario where a non-Zod error occurs
      vi.spyOn(envSchema, 'parse').mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      expect(() => ConfigManager.getInstance()).toThrow('Unexpected error');
    });

    it('safely handles empty getMasaApiKey when config is undefined', () => {
      process.env.MASA_API_KEY = 'test-key';
      const instance = ConfigManager.getInstance();

      // Simulate config being undefined (though this shouldn't happen in practice)
      // @ts-expect-error - Accessing private property for testing
      instance.config = undefined;

      expect(instance.getMasaApiKey()).toBe('');
    });
  });
});
