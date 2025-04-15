import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache: Map<string, {
    data: any,
    timestamp: number,
    expiry: number
  }> = new Map();

  constructor() { }

  /**
   * Get data from cache
   * @param key Cache key
   * @returns Cached data or null if not found/expired
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    // Not in cache
    if (!item) {
      return null;
    }
    
    // Check expiry
    if (item.expiry > 0 && Date.now() - item.timestamp > item.expiry) {
      this.remove(key);
      return null;
    }
    
    return item.data as T;
  }

  /**
   * Set data in cache
   * @param key Cache key
   * @param data Data to cache
   * @param expiryMs Optional expiry time in milliseconds (0 for no expiry)
   */
  set(key: string, data: any, expiryMs: number = 0): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: expiryMs
    });
  }

  /**
   * Remove item from cache
   * @param key Cache key
   */
  remove(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache or by prefix
   * @param prefix Optional prefix to clear only matching entries
   */
  clear(prefix?: string): void {
    if (prefix) {
      [...this.cache.keys()]
        .filter(key => key.startsWith(prefix))
        .forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }
} 