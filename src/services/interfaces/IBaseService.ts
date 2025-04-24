/**
 * Base service interface that all service interfaces should extend
 */
export interface IBaseService {
  /**
   * Returns the name of the service for logging and monitoring purposes
   */
  getServiceName(): string;
}
