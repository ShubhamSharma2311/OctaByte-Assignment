import axios from 'axios';
import * as cheerio from 'cheerio';
import { GoogleFinanceData } from '../types';

/**
 * Google Finance Scraper
 * 
 * Scrapes P/E Ratio and Latest Earnings from Google Finance
 * Uses web scraping with axios and cheerio
 */

// Scrape P/E and Earnings for a single stock
export async function fetchPEAndEarnings(symbol: string, exchange: string = 'NSE'): Promise<GoogleFinanceData | null> {
  try {
    console.log(`Scraping P/E and Earnings for ${symbol} from Google Finance...`);

    // Build URL: https://www.google.com/finance/quote/RELIANCE:NSE
    const url = `https://www.google.com/finance/quote/${symbol}:${exchange}`;
    
    // Fetch HTML page
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    // Parse HTML with cheerio
    const $ = cheerio.load(response.data);
    
    let peRatio: number | null = null;
    let latestEarnings: string | null = null;

    // Find P/E ratio and Earnings from the page
    // Google Finance uses specific CSS classes for data
    $('div[class*="gyFHrc"]').each((_, element) => {
      const label = $(element).find('div[class*="mfs7Fc"]').text().trim();
      const value = $(element).find('div[class*="P6K39c"]').text().trim();

      // Look for P/E ratio
      if (label.includes('P/E ratio') || label.includes('PE ratio')) {
        const parsed = parseFloat(value);
        if (!isNaN(parsed)) {
          peRatio = parsed;
        }
      }

      // Look for Earnings date
      if (label.includes('Earnings date') || label.includes('earnings')) {
        latestEarnings = value || null;
      }
    });

    console.log(`${symbol}: P/E=${peRatio}, Earnings=${latestEarnings}`);
    
    return {
      symbol,
      peRatio,
      latestEarnings,
      timestamp: new Date(),
    };
    
  } catch (error: any) {
    console.error(`Error scraping ${symbol}:`, error.message);
    return null;
  }
}

// Fetch P/E and Earnings for multiple stocks
export async function fetchMultiplePEAndEarnings(symbols: string[], exchange: string = 'NSE'): Promise<Map<string, GoogleFinanceData>> {
  const results = new Map<string, GoogleFinanceData>();
  
  console.log(`Scraping P/E and Earnings for ${symbols.length} stocks...`);

  // Scrape one by one with delay
  for (const symbol of symbols) {
    const data = await fetchPEAndEarnings(symbol, exchange);
    
    if (data) {
      results.set(symbol, data);
    }
    
    // Wait 2 seconds between requests to avoid getting blocked
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`Successfully scraped ${results.size}/${symbols.length} stocks`);
  return results;
}
