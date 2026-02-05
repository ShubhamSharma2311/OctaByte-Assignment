export interface ScraperResult {
  symbol: string;
  success: boolean;
  data?: any;
  error?: string;
  timestamp: Date;
}

export interface YahooFinanceData {
  symbol: string;
  cmp: number;
  timestamp: Date;
}

export interface GoogleFinanceData {
  symbol: string;
  peRatio: number | null;
  latestEarnings: string | null;
  timestamp: Date;
}

export interface ScraperStatus {
  isRunning: boolean;
  lastRunAt: Date | null;
  nextRunAt: Date | null;
  lastError: string | null;
}
