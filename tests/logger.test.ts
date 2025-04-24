import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger } from '../src/utils/logger';

describe('Logger', () => {
  // Spy on console methods
  const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

  // Store the original DEBUG and LOG_LEVEL values
  let originalDebug: string | undefined;
  let originalLogLevel: string | undefined;

  // Reset mocks and environment before each test
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-04-20T12:00:00Z'));

    // Store original DEBUG and LOG_LEVEL values
    originalDebug = process.env.DEBUG;
    originalLogLevel = process.env.LOG_LEVEL;

    // Clear console spies
    consoleLogSpy.mockClear();
    consoleErrorSpy.mockClear();
    consoleWarnSpy.mockClear();
    consoleInfoSpy.mockClear();
  });

  // Restore real timers and environment after each test
  afterEach(() => {
    vi.useRealTimers();

    // Restore original DEBUG value
    if (originalDebug === undefined) {
      delete process.env.DEBUG;
    } else {
      process.env.DEBUG = originalDebug;
    }
    // Restore original LOG_LEVEL value
    if (originalLogLevel === undefined) {
      delete process.env.LOG_LEVEL;
    } else {
      process.env.LOG_LEVEL = originalLogLevel;
    }
  });

  describe('Logger Singleton', () => {
    it('should return the same instance when getInstance is called multiple times', () => {
      const instance1 = Logger.getInstance();
      const instance2 = Logger.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('Logging Methods with DEBUG enabled', () => {
    beforeEach(() => {
      process.env.DEBUG = 'true';
      process.env.LOG_LEVEL = 'DEBUG';
    });

    it('should log messages with timestamp using log method when DEBUG=true', () => {
      const logger = Logger.getInstance();
      logger.log('Test message');

      expect(consoleLogSpy).toHaveBeenCalledWith('[2025-04-20T12:00:00.000Z]', 'Test message');
    });

    it('should log error messages with timestamp using error method when DEBUG=true', () => {
      const logger = Logger.getInstance();
      logger.error('Error message');

      expect(consoleErrorSpy).toHaveBeenCalledWith('[2025-04-20T12:00:00.000Z]', 'Error message');
    });

    it('should log warning messages with timestamp using warn method when DEBUG=true', () => {
      const logger = Logger.getInstance();
      logger.warn('Warning message');

      expect(consoleWarnSpy).toHaveBeenCalledWith('[2025-04-20T12:00:00.000Z]', 'Warning message');
    });

    it('should log info messages with timestamp using info method when DEBUG=true', () => {
      const logger = Logger.getInstance();
      logger.info('Info message');

      expect(consoleInfoSpy).toHaveBeenCalledWith('[2025-04-20T12:00:00.000Z]', 'Info message');
    });
  });

  describe('Logging Methods with DEBUG disabled', () => {
    beforeEach(() => {
      delete process.env.DEBUG;
    });

    it('should not log messages when DEBUG is not set to true', () => {
      const logger = Logger.getInstance();
      logger.log('Test message');
      logger.error('Error message');
      logger.warn('Warning message');
      logger.info('Info message');

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
    });

    it('should not log messages when DEBUG is set to something other than true', () => {
      process.env.DEBUG = 'false';

      const logger = Logger.getInstance();
      logger.log('Test message');

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('Additional Arguments', () => {
    beforeEach(() => {
      process.env.DEBUG = 'true';
      process.env.LOG_LEVEL = 'DEBUG';
    });

    it('should pass additional arguments to console.log', () => {
      const logger = Logger.getInstance();
      logger.log('Message with args', { id: 1 }, [1, 2, 3]);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[2025-04-20T12:00:00.000Z]',
        'Message with args',
        { id: 1 },
        [1, 2, 3]
      );
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      process.env.DEBUG = 'true';
      process.env.LOG_LEVEL = 'DEBUG';
    });

    it('should handle undefined message', () => {
      const logger = Logger.getInstance();
      logger.log(undefined);

      expect(consoleLogSpy).toHaveBeenCalledWith('[2025-04-20T12:00:00.000Z]', undefined);
    });

    it('should handle null message', () => {
      const logger = Logger.getInstance();
      logger.error(null);

      expect(consoleErrorSpy).toHaveBeenCalledWith('[2025-04-20T12:00:00.000Z]', null);
    });

    it('should handle numeric message', () => {
      const logger = Logger.getInstance();
      logger.warn(123);

      expect(consoleWarnSpy).toHaveBeenCalledWith('[2025-04-20T12:00:00.000Z]', 123);
    });
  });

  describe('Structured JSON Logging', () => {
    beforeEach(() => {
      process.env.DEBUG = 'true';
      process.env.LOG_LEVEL = 'DEBUG';
      process.env.LOG_FORMAT = 'json';
      consoleLogSpy.mockClear();
    });

    it('should emit valid JSON with correct fields for info()', () => {
      const logger = Logger.getInstance();
      logger.info('hello world', { userId: 42 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const output = (consoleLogSpy as any).mock.calls[0][0];
      const parsed = JSON.parse(output);
      expect(parsed).toHaveProperty('timestamp');
      expect(parsed.level).toBe('INFO');
      expect(parsed.message).toBe('hello world');
      expect(parsed.metadata).toEqual({ userId: 42 });
    });

    it('should use null metadata when none provided', () => {
      const logger = Logger.getInstance();
      logger.error('oops');

      const parsed = JSON.parse((consoleLogSpy as any).mock.calls[0][0]);
      expect(parsed.level).toBe('ERROR');
      expect(parsed.message).toBe('oops');
      expect(parsed.metadata).toBeNull();
    });
  });
});
