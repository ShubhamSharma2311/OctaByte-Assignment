import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  server: {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  cache: {
    cmpTTL: parseInt(process.env.CACHE_CMP_TTL || '30', 10),
    peRatioTTL: parseInt(process.env.CACHE_PE_RATIO_TTL || '21600', 10),
    earningsTTL: parseInt(process.env.CACHE_EARNINGS_TTL || '86400', 10),
  },
  scraper: {
    intervalMinutes: parseInt(process.env.SCRAPER_INTERVAL_MINUTES || '15', 10),
    timeoutMs: parseInt(process.env.SCRAPER_TIMEOUT_MS || '60000', 10),
  },
  portfolio: {
    filePath: path.resolve(__dirname, process.env.PORTFOLIO_FILE_PATH || '../../E555815F_58D029050B.xlsx'),
  },
};
