import express, { Application } from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { config } from './config';
import { routes } from './api';
import { portfolioLoader } from './utils';
import { scraperService } from './scrapers';

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Initialize and start server
async function startServer(): Promise<void> {
  try {
    console.log('\n========================================');
    console.log('PORTFOLIO BACKEND SERVER');
    console.log('========================================\n');

    // STEP 1: Load portfolio from Excel file
    console.log('STEP 1: Loading portfolio from Excel...');
    const stocks = portfolioLoader.load();
    console.log(`Loaded ${stocks.length} stocks\n`);

    // STEP 2: Start Express server FIRST (so Render detects the port)
    app.listen(config.server.port, () => {
      console.log('========================================');
      console.log(`SERVER RUNNING ON PORT ${config.server.port}`);
      console.log('========================================');
      console.log('\nAvailable Endpoints:');
      console.log(`  GET http://localhost:${config.server.port}/api/portfolio`);
      console.log(`  GET http://localhost:${config.server.port}/api/health`);
      console.log(`  GET http://localhost:${config.server.port}/api/status/scraper`);
      console.log(`  GET http://localhost:${config.server.port}/api/status/cache`);
      console.log('\n========================================\n');
    });

    // STEP 3: Run initial scraping in background (non-blocking)
    console.log('STEP 2: Starting initial scraping in background...\n');
    scraperService.runScraping()
      .then(() => console.log('\n[STARTUP] Initial scraping completed'))
      .catch((error: any) => console.error('[STARTUP] Initial scraping failed:', error.message));

    // STEP 4: Schedule periodic scraping using cron
    console.log(`STEP 3: Scheduling periodic scraping every ${config.scraper.intervalMinutes} minutes\n`);
    const cronExpression = `*/${config.scraper.intervalMinutes} * * * *`;
    
    cron.schedule(cronExpression, async () => {
      console.log('\n[CRON] Scheduled scraping triggered');
      await scraperService.runScraping();
    });
    
  } catch (error: any) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start the server
startServer();
