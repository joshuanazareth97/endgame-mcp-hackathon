import { IBaseService } from '../interfaces/IBaseService.js';
import { Logger } from '../../utils/logger.js';

/**
 * Base service implementation that provides common functionality
 * for all service implementations
 */
export abstract class BaseService implements IBaseService {
  protected readonly logger = Logger.getInstance();
  protected readonly serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  /**
   * Returns the name of the service
   */
  public getServiceName(): string {
    return this.serviceName;
  }

  /**
   * Logs a message with the service name prefix
   */
  protected logWithContext(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    ...args: unknown[]
  ): void {
    const contextMessage = `[${this.serviceName}] ${message}`;
    switch (level) {
      case 'debug':
        this.logger.debug(contextMessage, ...args);
        break;
      case 'info':
        this.logger.info(contextMessage, ...args);
        break;
      case 'warn':
        this.logger.warn(contextMessage, ...args);
        break;
      case 'error':
        this.logger.error(contextMessage, ...args);
        break;
    }
  }
}
