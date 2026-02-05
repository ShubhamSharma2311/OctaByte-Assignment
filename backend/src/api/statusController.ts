import { Request, Response } from 'express';
import { scraperService } from '../scrapers';
import { cacheService } from '../cache';

// Get scraper status
export function getScraperStatus(req: Request, res: Response): void {
  const status = scraperService.getStatus();
  res.json({
    success: true,
    data: status,
  });
}

// Get cache statistics
export function getCacheStats(req: Request, res: Response): void {
  const stats = cacheService.getStats();
  res.json({
    success: true,
    data: stats,
  });
}

// Health check endpoint
export function getHealth(req: Request, res: Response): void {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
}
