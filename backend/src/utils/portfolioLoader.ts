import * as XLSX from 'xlsx';
import { Stock } from '../types';
import { config } from '../config';

class PortfolioLoader {
  private stocks: Stock[] = [];

  // Load and parse Excel file
  load(): Stock[] {
    try {
      console.log('Loading portfolio from Excel file...');
      
      // Read Excel file
      const workbook = XLSX.readFile(config.portfolio.filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const rows: any[] = XLSX.utils.sheet_to_json(worksheet);
      
      // Debug: Show available columns
      if (rows.length > 0) {
        console.log('Excel columns found:', Object.keys(rows[0]).join(', '));
      }
      
      // Skip first row (it's the header row) and filter out sector summary rows
      const dataRows = rows.slice(1).filter(row => row.__EMPTY && typeof row.__EMPTY === 'number');

      // Parse each row into Stock object
      this.stocks = dataRows.map((row, index) => {
        const purchasePrice = parseFloat(row.__EMPTY_2 || 0);
        const quantity = parseFloat(row.__EMPTY_3 || 0);
        const investment = purchasePrice * quantity;

        return {
          particulars: row.__EMPTY_1 || `Stock ${index + 1}`,
          purchasePrice,
          quantity,
          investment,
          portfolioPercentage: 0, // Will be calculated below
          exchange: 'NSE',
          sector: 'Unknown',
          symbol: String(row.__EMPTY_6 || ''),
        };
      });

      // Calculate portfolio percentages
      this.calculatePortfolioPercentages();
      
      console.log(`Loaded ${this.stocks.length} stocks successfully`);
      console.log('Stock symbols:', this.stocks.map(s => s.symbol).join(', '));
      return this.stocks;
      
    } catch (error) {
      console.error('Error loading portfolio file:', error);
      throw new Error('Failed to load portfolio data');
    }
  }

  // Extract symbol from stock name like "Reliance Industries (RELIANCE)"
  private extractSymbolFromName(particulars: string): string {
    if (!particulars) return '';
    
    // Try to find text in parentheses
    const match = particulars.match(/\(([^)]+)\)/);
    if (match) return match[1];
    
    // Otherwise use first word
    return particulars.split(' ')[0];
  }

  // Calculate what percentage each stock is of total portfolio
  private calculatePortfolioPercentages(): void {
    const totalInvestment = this.stocks.reduce((sum, stock) => sum + stock.investment, 0);
    
    this.stocks.forEach(stock => {
      stock.portfolioPercentage = totalInvestment > 0 
        ? (stock.investment / totalInvestment) * 100 
        : 0;
    });
  }

  // Get all stocks
  getStocks(): Stock[] {
    return this.stocks;
  }

  // Get just the symbols for scraping
  getSymbols(): string[] {
    return this.stocks.map(stock => stock.symbol).filter(symbol => symbol);
  }
}

// Export single instance
export const portfolioLoader = new PortfolioLoader();
