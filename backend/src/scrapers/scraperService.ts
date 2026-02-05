import { cacheService } from '../cache';
import { fetchMultipleStockPrices } from './yahooFinanceScraper';
import { fetchMultiplePEAndEarnings } from './googleFinanceScraper';
import { portfolioLoader } from '../utils';
import { config } from '../config';
import { ScraperStatus } from '../types';

class ScraperService {
  private status: ScraperStatus = {
    isRunning: false,
    lastRunAt: null,
    nextRunAt: null,
    lastError: null,
  };

  async runScraping(): Promise<void> {
    if (!cacheService.lockScraper()) {
      console.log('Scraper already running, skipping this cycle');
      return;
    }

    let lockAcquired = true;
    try {
      this.status.isRunning = true;
      this.status.lastRunAt = new Date();
      console.log('\n========== STARTING SCRAPING CYCLE ==========');

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

      console.log('\n--- Fetching P/E and Earnings from Google Finance ---');
      const googleResults = await fetchMultiplePEAndEarnings(symbols);
      
      googleResults.forEach((data, symbol) => {
        if (data.peRatio !== null) {
          const peKey = `pe_ratio:${symbol}`;
          cacheService.set(peKey, data.peRatio, config.cache.peRatioTTL);
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
      this.status.isRunning = false;
      if (lockAcquired) {
        cacheService.unlockScraper();
      }
      this.updateNextRunTime();
    }
  }

  private updateNextRunTime(): void {
    const intervalMs = config.scraper.intervalMinutes * 60 * 1000;
    this.status.nextRunAt = new Date(Date.now() + intervalMs);
  }

  getStatus(): ScraperStatus {
    return { ...this.status };
  }
}

export const scraperService = new ScraperService();
