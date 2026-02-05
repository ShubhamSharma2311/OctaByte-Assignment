export interface Stock {
  particulars: string;
  purchasePrice: number;
  quantity: number;
  investment: number;
  portfolioPercentage: number;
  exchange: string;
  sector: string;
  symbol: string;
}

export interface MarketData {
  cmp: number;
  peRatio: number | null;
  latestEarnings: string | null;
  updatedAt: Date;
}

export interface StockWithMarketData extends Stock {
  cmp: number;
  presentValue: number;
  gainLoss: number;
  gainLossPercentage: number;
  peRatio: number | null;
  latestEarnings: string | null;
  lastUpdated: Date;
}

export interface SectorSummary {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number;
  gainLoss: number;
  gainLossPercentage: number;
  stocks: StockWithMarketData[];
}

export interface PortfolioSummary {
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  sectors: SectorSummary[];
  lastUpdated: Date;
}
