// Cache Manager for AI Rewriter

import { cacheStorage, secureStorage } from '../../utils/storage';
import type { RewriteResult, RewriteMode } from '../types/ai-rewriter';

/**
 * Simple hash function for cache keys
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Cache Manager - Handles caching of rewrite results
 */
export class CacheManager {
  private prefix = 'rewrite_cache_';

  /**
   * Generate a cache key
   */
  generateKey(text: string, mode: RewriteMode): string {
    const hash = simpleHash(text + mode);
    return `cache_${hash}`;
  }

  /**
   * Get a cached result
   */
  get(text: string, mode: RewriteMode): RewriteResult | null {
    const key = this.generateKey(text, mode);
    const cached = cacheStorage.get<RewriteResult>(key);

    if (cached) {
      return {
        ...cached,
        fromCache: true,
      };
    }

    return null;
  }

  /**
   * Store a result in cache
   */
  set(text: string, mode: RewriteMode, result: RewriteResult, ttl?: number): void {
    const key = this.generateKey(text, mode);
    cacheStorage.set<RewriteResult>(key, result, ttl);
  }

  /**
   * Remove a cached result
   */
  remove(text: string, mode: RewriteMode): void {
    const key = this.generateKey(text, mode);
    secureStorage.remove(key);
  }

  /**
   * Clear all cached results
   */
  clearAll(): void {
    // This would need access to localStorage directly
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Get cache statistics
   */
  getStats(): { count: number; oldestEntry: number | null } {
    let count = 0;
    let oldestTimestamp: number | null = null;

    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes(this.prefix)) {
        count++;
        const item = localStorage.getItem(key);
        if (item) {
          try {
            const parsed = JSON.parse(item);
            if (parsed.timestamp) {
              if (!oldestTimestamp || parsed.timestamp < oldestTimestamp) {
                oldestTimestamp = parsed.timestamp;
              }
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    });

    return { count, oldestEntry: oldestTimestamp };
  }
}

/**
 * Singleton instance
 */
let cacheManagerInstance: CacheManager | null = null;

export function getCacheManager(): CacheManager {
  if (!cacheManagerInstance) {
    cacheManagerInstance = new CacheManager();
  }
  return cacheManagerInstance;
}
