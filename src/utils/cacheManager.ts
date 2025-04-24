import { LRUCache } from 'lru-cache';

export interface CacheConfig {
  maxSize?: number;
  ttl?: number; // in milliseconds
}

export class CacheManager {
  private static instance: CacheManager;
  private caches: Map<string, LRUCache<string, any>> = new Map();

  private constructor() {}

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Retrieve or create a named cache.
   */
  public getCache(name: string, config?: CacheConfig): LRUCache<string, any> {
    if (!this.caches.has(name)) {
      this.caches.set(
        name,
        new LRUCache<string, any>({
          max: config?.maxSize ?? 100,
          ttl: config?.ttl ?? 1000 * 60 * 5,
        })
      );
    }
    return this.caches.get(name)!;
  }

  /**
   * Get a value from a named cache.
   */
  public get(name: string, key: string): any {
    return this.getCache(name).get(key);
  }

  /**
   * Set a value in a named cache.
   */
  public set(name: string, key: string, value: any, config?: CacheConfig): void {
    const cache = this.getCache(name, config);
    cache.set(key, value);
  }

  /**
   * Delete a key from a named cache.
   */
  public del(name: string, key: string): void {
    this.getCache(name).delete(key);
  }

  /**
   * Clear an entire named cache.
   */
  public clear(name: string): void {
    this.caches.delete(name);
  }
}
