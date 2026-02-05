export interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  updatedAt: number;
}

export interface CacheConfig {
  cmpTTL: number;
  peRatioTTL: number;
  earningsTTL: number;
}

export enum CacheKey {
  CMP = 'cmp',
  PE_RATIO = 'pe_ratio',
  EARNINGS = 'earnings',
  PORTFOLIO = 'portfolio'
}
