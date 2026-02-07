import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  server: {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  cache: {
    cmpTTL: parseInt(process.env.CACHE_CMP_TTL || '900', 10),
    peRatioTTL: parseInt(process.env.CACHE_PE_RATIO_TTL || '3600', 10),
    earningsTTL: parseInt(process.env.CACHE_EARNINGS_TTL || '3600', 10),
  },
  scraper: {
    intervalMinutes: parseInt(process.env.SCRAPER_INTERVAL_MINUTES || '15', 10),
    timeoutMs: parseInt(process.env.SCRAPER_TIMEOUT_MS || '60000', 10),
  },
  portfolio: {
    filePath: process.env.PORTFOLIO_FILE_PATH || path.join(__dirname, '../../E555815F_58D029050B.xlsx'),
  },
};
