import { describe, it, expect } from 'vitest';
import { CacheManager } from '../src/utils/cacheManager';

describe('CacheManager', () => {
  it('should return the same singleton instance', () => {
    const m1 = CacheManager.getInstance();
    const m2 = CacheManager.getInstance();
    expect(m1).toBe(m2);
  });

  it('should set and get values correctly', () => {
    const cm = CacheManager.getInstance();
    cm.clear('basic');
    cm.set('basic', 'key1', 'value1');
    expect(cm.get('basic', 'key1')).toBe('value1');
  });

  it('should delete a key', () => {
    const cm = CacheManager.getInstance();
    cm.clear('deleteTest');
    cm.set('deleteTest', 'foo', 123);
    cm.del('deleteTest', 'foo');
    expect(cm.get('deleteTest', 'foo')).toBeUndefined();
  });

  it('should clear all entries in a cache', () => {
    const cm = CacheManager.getInstance();
    cm.clear('clearTest');
    cm.set('clearTest', 'a', 1);
    cm.set('clearTest', 'b', 2);
    cm.clear('clearTest');
    expect(cm.get('clearTest', 'a')).toBeUndefined();
    expect(cm.get('clearTest', 'b')).toBeUndefined();
  });

  it('should isolate named caches', () => {
    const cm = CacheManager.getInstance();
    cm.clear('A');
    cm.clear('B');
    cm.set('A', 'k', 'vA');
    expect(cm.get('A', 'k')).toBe('vA');
    expect(cm.get('B', 'k')).toBeUndefined();
  });

  it('should evict least recently used items when maxSize is exceeded', () => {
    const cm = CacheManager.getInstance();
    cm.clear('lruTest');
    // custom maxSize=3
    cm.set('lruTest', '1', 'one', { maxSize: 3 });
    cm.set('lruTest', '2', 'two');
    cm.set('lruTest', '3', 'three');
    cm.set('lruTest', '4', 'four');
    expect(cm.get('lruTest', '1')).toBeUndefined();
    expect(cm.get('lruTest', '2')).toBe('two');
  });

  it('should expire items based on TTL', async () => {
    const cm = CacheManager.getInstance();
    const name = 'ttlTest';
    cm.clear(name);
    cm.set(name, 'temp', 'data', { ttl: 50 });
    expect(cm.get(name, 'temp')).toBe('data');
    // wait longer than TTL
    await new Promise(r => setTimeout(r, 60));
    expect(cm.get(name, 'temp')).toBeUndefined();
  });

  it('getting a non-existent key should return undefined', () => {
    const cm = CacheManager.getInstance();
    cm.clear('nonExist');
    expect(cm.get('nonExist', 'noKey')).toBeUndefined();
  });

  it('deleting or clearing an empty cache should not throw', () => {
    const cm = CacheManager.getInstance();
    expect(() => cm.del('empty', 'x')).not.toThrow();
    expect(() => cm.clear('empty')).not.toThrow();
  });
});
