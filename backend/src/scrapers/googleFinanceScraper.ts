import axios from 'axios';
import * as cheerio from 'cheerio';
import { GoogleFinanceData } from '../types';

const BSE_TO_NSE_MAP: Record<string, string> = {
  '532174': 'ICICIBANK',
  '544252': 'BAJAJHFL',
  '542651': 'KPITTECH',
  '544028': 'TATATECH',
  '544107': 'BLSE',
  '532790': 'TANLA',
  '532540': 'TATACONSUM',
  '500331': 'PIDILITIND',
  '500400': 'TATAPOWER',
  '542323': 'KPIGREEN',
  '532667': 'SUZLON',
  '542851': 'GENSOL',
  '543517': 'HARIOMPIPE',
  '542652': 'POLYCAB',
  '543318': 'CLEANSCIENCE',
  '506401': 'DEEPAKNTR',
  '541557': 'FINEORG',
  '533282': 'GRAVITA',
  '540719': 'SBILIFE',
  '500209': 'INFY',
  '543237': 'HAPPSTMNDS',
  '543272': 'EASEMYTRIP',
  '511577': 'STEL',
};

function formatSymbolForGoogle(symbol: string): string {
  const symbolStr = String(symbol).trim();
  if (!symbolStr) return symbolStr;
  if (symbolStr.includes(':')) return symbolStr;

  if (BSE_TO_NSE_MAP[symbolStr]) {
    return `${BSE_TO_NSE_MAP[symbolStr]}:NSE`;
  }

  if (/^\d+$/.test(symbolStr)) {
    return `${symbolStr}:BOM`;
  }

  return `${symbolStr}:NSE`;
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

// Scrape P/E and Earnings for a single stock
export async function fetchPEAndEarnings(symbol: string): Promise<GoogleFinanceData | null> {
  try {
    console.log(`Scraping P/E and Earnings for ${symbol} from Google Finance...`);

    // Build URL: https://www.google.com/finance/quote/RELIANCE:NSE
    const googleSymbol = formatSymbolForGoogle(symbol);
    const url = `https://www.google.com/finance/quote/${googleSymbol}`;
    
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

    if (!latestEarnings) {
      const labelNodes = $('*').filter((_, el) => {
        const text = normalizeText($(el).text());
        return /earnings date/i.test(text);
      });

      labelNodes.each((_, el) => {
        if (latestEarnings) return;
        const labelText = normalizeText($(el).text());
        const parent = $(el).parent();
        const parentText = normalizeText(parent.text());
        const siblingText = normalizeText(
          parent
            .children()
            .map((_, child) => normalizeText($(child).text()))
            .get()
            .filter(text => text && text !== labelText)
            .join(' ')
        );

        const candidate = siblingText || parentText.replace(labelText, '').trim();
        if (candidate) {
          latestEarnings = candidate;
        }
      });
    }

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
export async function fetchMultiplePEAndEarnings(symbols: string[]): Promise<Map<string, GoogleFinanceData>> {
  const results = new Map<string, GoogleFinanceData>();
  
  console.log(`Scraping P/E and Earnings for ${symbols.length} stocks...`);

  // Scrape one by one with delay
  for (const symbol of symbols) {
    const data = await fetchPEAndEarnings(symbol);
    
    if (data) {
      results.set(symbol, data);
    }
    
    // Wait 2 seconds between requests to avoid getting blocked
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`Successfully scraped ${results.size}/${symbols.length} stocks`);
  return results;
}
