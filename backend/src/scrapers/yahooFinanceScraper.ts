import axios from 'axios';
import { YahooFinanceData } from '../types';

// Mapping of BSE codes to NSE symbols for Indian stocks
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

// Convert symbol to Yahoo Finance format
function formatSymbolForYahoo(symbol: string): string {
  const symbolStr = String(symbol);
  
  // If already has exchange suffix, return as is
  if (symbolStr.includes('.')) return symbolStr;
  
  // Check if it's a BSE code that we can map to NSE
  if (BSE_TO_NSE_MAP[symbolStr]) {
    return `${BSE_TO_NSE_MAP[symbolStr]}.NS`;
  }
  
  // For text symbols, use NSE
  return `${symbolStr}.NS`;
}

// Fetch CMP for a single stock symbol
export async function fetchStockPrice(symbol: string | number): Promise<YahooFinanceData | null> {
  try {
    const symbolStr = String(symbol);
    const yahooSymbol = formatSymbolForYahoo(symbolStr);
    console.log(`Fetching price for ${symbolStr} (${yahooSymbol})...`);
    
    // Yahoo Finance API endpoint
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });
    
    // Extract price from response
    const result = response.data?.chart?.result?.[0];
    const price = result?.meta?.regularMarketPrice;
    
    if (!price) {
      console.log(`No price found for ${symbolStr}`);
      return null;
    }
    
    console.log(`Price for ${symbolStr}: ${price}`);
    
    return {
      symbol: symbolStr,
      cmp: price,
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
      results.set(String(symbol), data);
    }
    
    // Wait 500ms between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`Successfully fetched ${results.size}/${symbols.length} prices`);
  return results;
}
