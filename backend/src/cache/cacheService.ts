import { CacheEntry } from '../types';

class CacheService {
  private cache: Map<string, CacheEntry<any>>;
  private scraperLock: boolean;

  constructor() {
    this.cache = new Map();
    this.scraperLock = false;
  }

  set<T>(key: string, data: T, ttlSeconds: number): void {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      expiresAt: now + ttlSeconds * 1000,
      updatedAt: now,
    };
    this.cache.set(key, entry);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  getStale<T>(key: string): T | null {
    const entry = this.cache.get(key);
    return entry ? (entry.data as T) : null;
  }

  // Lock mechanism to prevent overlapping scrapes
  lockScraper(): boolean {
    if (this.scraperLock) return false;
    this.scraperLock = true;
    return true;
  }

  unlockScraper(): void {
    this.scraperLock = false;
  }

  isScraperLocked(): boolean {
    return this.scraperLock;
  }

  getStats() {
    const entries = Array.from(this.cache.entries());
    return {
      totalEntries: entries.length,
      scraperLocked: this.scraperLock,
      entries: entries.map(([key, value]) => ({
        key,
        expired: Date.now() > value.expiresAt,
        updatedAt: new Date(value.updatedAt),
        expiresAt: new Date(value.expiresAt),
      })),
    };
  }
}

export const cacheService = new CacheService();
