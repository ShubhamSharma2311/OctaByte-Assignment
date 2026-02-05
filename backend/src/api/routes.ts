import { Router } from 'express';
import { getPortfolio } from './portfolioController';
import { getScraperStatus, getCacheStats, getHealth } from './statusController';

const router = Router();

// Main portfolio endpoint
router.get('/portfolio', getPortfolio);

// Monitoring endpoints
router.get('/status/scraper', getScraperStatus);
router.get('/status/cache', getCacheStats);
router.get('/health', getHealth);

export default router;
