export interface Stock {
  symbol: string;
  particulars: string;
  sector: string;
  purchasePrice: number;
  quantity: number;
  investment: number;
  portfolioPercentage: number;
  exchange: string;
  cmp?: number;
  presentValue?: number;
  gainLoss?: number;
  gainLossPercentage?: number;
  peRatio?: number;
  latestEarnings?: string;
}

export interface SectorSummary {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number;
  gainLoss: number;
  gainLossPercentage: number;
  stocks: Stock[];
}

export interface PortfolioData {
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  sectors: SectorSummary[];
  lastUpdated: string;
}

export interface ApiResponse {
  success: boolean;
  data: PortfolioData;
  message?: string;
}