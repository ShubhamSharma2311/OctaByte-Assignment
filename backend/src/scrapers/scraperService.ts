import { cacheService } from '../cache';
import { fetchMultipleStockPrices } from './yahooFinanceScraper';
import { fetchMultiplePEAndEarnings } from './googleFinanceScraper';
import { portfolioLoader } from '../utils';
import { config } from '../config';
import { ScraperStatus } from '../types';

/**
 * DATA REFRESH LAYER (Background Scraper)
 * 
 * This runs in the background and periodically scrapes market data.
 * It updates the cache with latest prices, P/E ratios, and earnings.
 * 
 * Key Points:
 * 1. Runs every 15 minutes (configurable)
 * 2. Uses lock to prevent overlapping runs
 * 3. Scrapes only stocks in portfolio
 * 4. Updates cache after scraping
 */

class ScraperService {
  private status: ScraperStatus = {
    isRunning: false,
    lastRunAt: null,
    nextRunAt: null,
    lastError: null,
  };

  // Main scraping function - runs periodically in background
  async runScraping(): Promise<void> {
    
    // STEP 1: Check if scraper is already running
    if (!cacheService.lockScraper()) {
      console.log('Scraper already running, skipping this cycle');
      return;
    }

    try {
      this.status.isRunning = true;
      this.status.lastRunAt = new Date();
      console.log('\n========== STARTING SCRAPING CYCLE ==========');

      // STEP 2: Get list of stocks from portfolio
      const stocks = portfolioLoader.getStocks();
      if (stocks.length === 0) {
        console.log('No stocks found in portfolio');
        return;
      }

      const symbols = stocks.map(s => s.symbol).filter(s => s);
      console.log(`Scraping data for ${symbols.length} stocks`);
      console.log('Symbols to scrape:', symbols.join(', '));
      
      if (symbols.length === 0) {
        console.error('ERROR: No symbols found! Check Excel file column names.');
        return;
      }

      // STEP 3: Fetch Current Market Price from Yahoo Finance
      console.log('\n--- Fetching prices from Yahoo Finance ---');
      const priceResults = await fetchMultipleStockPrices(symbols);
      
      console.log(`\nPrice scraping complete: ${priceResults.size} out of ${symbols.length} successful`);
      
      // Save to cache with TTL
      priceResults.forEach((data, symbol) => {
        const cacheKey = `cmp:${symbol}`;
        cacheService.set(cacheKey, data, config.cache.cmpTTL);
        console.log(`Cached price for ${symbol}: ${data.cmp}`);
      });
      
      if (priceResults.size === 0) {
        console.error('WARNING: No prices were fetched! Check symbol format or Yahoo Finance API.');
      }

      // STEP 4: Fetch P/E and Earnings from Google Finance
      console.log('\n--- Fetching P/E and Earnings from Google Finance ---');
      const googleResults = await fetchMultiplePEAndEarnings(symbols);
      
      // Save to cache with TTL
      googleResults.forEach((data, symbol) => {
        if (data.peRatio !== null) {
          const peKey = `pe_ratio:${symbol}`;
          console.log(`Cached P/E for ${symbol}: ${data.peRatio}`);
        }
        
        if (data.latestEarnings !== null) {
          const earningsKey = `earnings:${symbol}`;
          cacheService.set(earningsKey, data.latestEarnings, config.cache.earningsTTL);
          console.log(`Cached earnings for ${symbol}: ${data.latestEarnings}`);
        }
      });

      console.log('\n========== SCRAPING CYCLE COMPLETED ==========\n');
      this.status.lastError = null;
      
    } catch (error: any) {
      console.error('Error during scraping:', error.message);
      this.status.lastError = error.message;
      
    } finally {
      // STEP 5: Release lock and update status
      this.status.isRunning = false;
      cacheService.unlockScraper();
      this.updateNextRunTime();
    }
  }

  // Calculate when scraper will run next
  private updateNextRunTime(): void {
    const intervalMs = config.scraper.intervalMinutes * 60 * 1000;
    this.status.nextRunAt = new Date(Date.now() + intervalMs);
  }

  // Get scraper status for monitoring
  getStatus(): ScraperStatus {
    return { ...this.status };
  }
}

// Export single instance
export const scraperService = new ScraperService();
