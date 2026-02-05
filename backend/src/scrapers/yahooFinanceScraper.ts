import yahooFinance from 'yahoo-finance2';
import { YahooFinanceData } from '../types';

/**
 * Yahoo Finance Scraper
 * 
 * Fetches Current Market Price (CMP) for stocks
 * Uses yahoo-finance2 unofficial library
 */

// Fetch CMP for a single stock symbol
export async function fetchStockPrice(symbol: string): Promise<YahooFinanceData | null> {
  try {
    console.log(`Fetching price for ${symbol} from Yahoo Finance...`);
    
    // Call Yahoo Finance API
    const quote: any = await yahooFinance.quote(symbol);
    
    // Check if data is valid
    if (!quote || !quote.regularMarketPrice) {
      console.log(`No price found for ${symbol}`);
      return null;
    }

    // Return formatted data
    return {
      symbol,
      cmp: quote.regularMarketPrice,
      timestamp: new Date(),
    };
    
  } catch (error: any) {
    console.error(`Error fetching price for ${symbol}:`, error.message);
    return null;
  }
}

// Fetch CMP for multiple stocks
export async function fetchMultipleStockPrices(symbols: string[]): Promise<Map<string, YahooFinanceData>> {
  const results = new Map<string, YahooFinanceData>();
  
  console.log(`Fetching prices for ${symbols.length} stocks...`);

  // Fetch one by one with delay to avoid rate limiting
  for (const symbol of symbols) {
    const data = await fetchStockPrice(symbol);
    
    if (data) {
      results.set(symbol, data);
    }
    
    // Wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`Successfully fetched ${results.size}/${symbols.length} prices`);
  return results;
}
