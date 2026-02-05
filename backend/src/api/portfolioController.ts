import { Request, Response } from 'express';
import { cacheService } from '../cache';
import { portfolioLoader } from '../utils';
import { StockWithMarketData, SectorSummary, PortfolioSummary } from '../types';

// Main function to get portfolio data
export function getPortfolio(req: Request, res: Response): void {
  try {
    console.log('API Request: GET /api/portfolio');

    // STEP 1: Get static portfolio data (purchase price, quantity, etc)
    const stocks = portfolioLoader.getStocks();
    if (stocks.length === 0) {
      res.status(404).json({ 
        success: false, 
        message: 'Portfolio data not loaded' 
      });
      return;
    }

    // STEP 2: For each stock, get market data from cache
    const stocksWithMarketData: StockWithMarketData[] = stocks.map(stock => {
      
      // Read from cache using keys
      const cmpKey = `cmp:${stock.symbol}`;
      const peKey = `pe_ratio:${stock.symbol}`;
      const earningsKey = `earnings:${stock.symbol}`;

      // Get stale data (even if expired) to always return something
      const cmpData = cacheService.getStale<any>(cmpKey);
      const cmp = cmpData?.cmp || stock.purchasePrice; // Fallback to purchase price
      
      const peRatio = cacheService.getStale<number>(peKey);
      const latestEarnings = cacheService.getStale<string>(earningsKey);

      // STEP 3: Calculate present value and gain/loss
      const presentValue = cmp * stock.quantity;
      const gainLoss = presentValue - stock.investment;
      const gainLossPercentage = stock.investment > 0 
        ? (gainLoss / stock.investment) * 100 
        : 0;

      return {
        ...stock,
        cmp,
        presentValue,
        gainLoss,
        gainLossPercentage,
        peRatio: peRatio || null,
        latestEarnings: latestEarnings || null,
        lastUpdated: cmpData?.timestamp || new Date(),
      };
    });

    // STEP 4: Group stocks by sector
    const sectors = groupBySector(stocksWithMarketData);
    
    // STEP 5: Calculate overall summary
    const summary = calculateSummary(sectors);

    // STEP 6: Return response
    res.json({
      success: true,
      data: summary,
    });
    
  } catch (error: any) {
    console.error('Error in getPortfolio:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}

// Group stocks by sector and calculate sector totals
function groupBySector(stocks: StockWithMarketData[]): SectorSummary[] {
  const sectorMap = new Map<string, StockWithMarketData[]>();

  // Group stocks
  stocks.forEach(stock => {
    const sector = stock.sector || 'Unknown';
    if (!sectorMap.has(sector)) {
      sectorMap.set(sector, []);
    }
    sectorMap.get(sector)!.push(stock);
  });

  // Calculate totals for each sector
  return Array.from(sectorMap.entries()).map(([sector, stocks]) => {
    const totalInvestment = stocks.reduce((sum, s) => sum + s.investment, 0);
    const totalPresentValue = stocks.reduce((sum, s) => sum + s.presentValue, 0);
    const gainLoss = totalPresentValue - totalInvestment;
    const gainLossPercentage = totalInvestment > 0 
      ? (gainLoss / totalInvestment) * 100 
      : 0;

    return {
      sector,
      totalInvestment,
      totalPresentValue,
      gainLoss,
      gainLossPercentage,
      stocks,
    };
  });
}

// Calculate overall portfolio summary
function calculateSummary(sectors: SectorSummary[]): PortfolioSummary {
  const totalInvestment = sectors.reduce((sum, s) => sum + s.totalInvestment, 0);
  const totalPresentValue = sectors.reduce((sum, s) => sum + s.totalPresentValue, 0);
  const totalGainLoss = totalPresentValue - totalInvestment;
  const totalGainLossPercentage = totalInvestment > 0 
    ? (totalGainLoss / totalInvestment) * 100 
    : 0;

  return {
    totalInvestment,
    totalPresentValue,
    totalGainLoss,
    totalGainLossPercentage,
    sectors,
    lastUpdated: new Date(),
  };
}
