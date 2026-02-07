# Dynamic Portfolio Dashboard

A full-stack web application that provides real-time portfolio tracking with live market data from Yahoo Finance and Google Finance. The system features a three-layer architecture with background scraping, intelligent caching, and instant API responses.

## Project Overview

This application displays stock portfolio performance with automatic data refresh every 15 seconds. It loads portfolio holdings from an Excel file, fetches current market prices and financial metrics from external sources, and presents comprehensive analytics through a responsive dashboard.

## Features

### Core Functionality
- Real-time portfolio tracking with 29 stock holdings
- Live market data fetching from Yahoo Finance (CMP) and Google Finance (P/E Ratio, Earnings)
- Automatic data refresh every 15 minutes
- Instant API response (under 50ms) through intelligent caching
- Present value and gain/loss calculations
- Sector-wise portfolio grouping and analysis
- Visual indicators for gains (green) and losses (red)

### Technical Features
- Three-layer architecture (API, Cache, Data Refresh)
- Stale-while-revalidate caching strategy
- Background job processing with node-cron
- Excel file parsing for portfolio data
- BSE to NSE symbol conversion
- Responsive design for mobile, tablet, and desktop
- Type-safe implementation with TypeScript

## Technology Stack

### Backend
- Node.js with TypeScript
- Express.js for REST API
- Axios for HTTP requests
- Cheerio for web scraping
- XLSX for Excel file parsing
- Node-cron for scheduled tasks
- CORS for cross-origin requests

### Frontend
- Next.js 14 (React 19)
- TypeScript (strict mode)
- Tailwind CSS for styling
- TanStack React Table for data tables
- Recharts for visualizations
- Axios for API calls

## Architecture

### Three-Layer Design

**Layer 1: API Layer**
- Handles HTTP requests from frontend
- Reads only from cache, never triggers scraping
- Returns data instantly (30-50ms response time)
- Implements graceful error handling

**Layer 2: Cache Layer**
- In-memory storage with TTL (Time To Live)
- Serves stale data when fresh data unavailable
- Prevents overlapping scraper runs with lock mechanism
- Stores CMP, P/E ratios, and earnings data

**Layer 3: Data Refresh Layer**
- Runs in background every 15 minutes
- Scrapes Yahoo Finance and Google Finance in parallel
- Updates cache independently of API requests
- Handles partial failures gracefully

## Project Structure

```
Ebyte_assignment/
├── backend/
│   ├── src/
│   │   ├── api/              # API routes and controllers
│   │   ├── cache/            # Cache service implementation
│   │   ├── config/           # Configuration settings
│   │   ├── scrapers/         # Yahoo and Google Finance scrapers
│   │   ├── types/            # TypeScript type definitions
│   │   ├── utils/            # Portfolio loader and utilities
│   │   └── index.ts          # Server entry point
│   ├── E555815F_58D029050B.xlsx    # Portfolio Excel file
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── app/                  # Next.js app directory
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom React hooks
│   │   └── types/            # TypeScript interfaces
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Installation and Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Git

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Ensure Excel file is present:
```bash
# The file E555815F_58D029050B.xlsx should be in the backend folder
```

4. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### GET /api/portfolio
Returns complete portfolio data with market information.

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "totalInvestment": 1000000,
    "totalPresentValue": 1150000,
    "totalGainLoss": 150000,
    "totalGainLossPercentage": 15.0,
    "sectors": [
      {
        "sector": "Technology",
        "totalInvestment": 500000,
        "totalPresentValue": 575000,
        "gainLoss": 75000,
        "gainLossPercentage": 15.0,
        "stocks": [...]
      }
    ],
    "lastUpdated": "2026-02-07T10:30:00.000Z"
  }
}
```

#### GET /api/status
Returns scraper status and health information.

#### GET /api/health
Simple health check endpoint.

## Configuration

### Backend Configuration (backend/src/config/index.ts)

- **Cache TTL:**
  - CMP: 900 seconds (15 minutes)
  - P/E Ratio: 3600 seconds (1 hour)
  - Earnings: 3600 seconds (1 hour)

- **Scraper Interval:** 15 minutes
- **Port:** 5000
- **Excel File Path:** ./E555815F_58D029050B.xlsx

### Frontend Configuration

- **API URL:** http://localhost:5000/api
- **Auto-refresh Interval:** 15 seconds
- **Port:** 3000

## Data Flow

1. **Startup:**
   - Backend loads Excel file containing 29 stocks
   - Initial scraping runs to populate cache
   - Express server starts and accepts requests
   - Frontend connects and fetches initial data

2. **Runtime:**
   - Frontend auto-refreshes every 15 seconds by calling API
   - API reads from cache and responds instantly
   - Background scraper runs every 15 minutes
   - Scraper updates cache with latest market data
   - Frontend displays updated data on next refresh

3. **Error Handling:**
   - If scraping fails, serve stale cached data
   - If cache is empty, fallback to purchase price
   - Frontend continues showing last successful data
   - Error messages displayed without breaking UI

## Key Challenges and Solutions

### Challenge 1: Excel File Structure
- **Problem:** Excel file had unusual column names (__EMPTY, __EMPTY_1)
- **Solution:** Mapped columns by index and filtered empty rows

### Challenge 2: Yahoo Finance API Limitations
- **Problem:** No official public API, libraries unreliable
- **Solution:** Direct HTTP requests to internal API endpoint

### Challenge 3: BSE vs NSE Symbol Conversion
- **Problem:** Excel contains BSE codes, Yahoo Finance expects NSE symbols
- **Solution:** Created mapping dictionary for 29 stocks

### Challenge 4: Slow Scraping Blocking API
- **Problem:** Scraping takes 30-60 seconds, API needs instant response
- **Solution:** Three-layer architecture with background processing

### Challenge 5: Data Freshness vs Availability
- **Problem:** What to show when scraping fails
- **Solution:** Stale-while-revalidate pattern serves cached data

## Performance Metrics

- API Response Time: 30-50ms (cache hits)
- Scraper Runtime: 30-60 seconds
- Auto-refresh Frequency: 15 seconds (frontend), 15 minutes (backend)
- Current Success Rate: 8/29 stocks (Yahoo Finance), 100% structure (Google Finance)
- Memory Usage: Minimal (in-memory cache for 29 stocks)

## Environment Variables

No environment variables are currently required. All configuration is in code files. For production deployment, consider externalizing:

- PORT
- EXCEL_FILE_PATH
- API_BASE_URL
- CACHE_TTL_SECONDS
- SCRAPER_INTERVAL_MINUTES

## Deployment

### Backend Deployment (Render/Railway)

1. Push code to GitHub repository
2. Connect repository to hosting platform
3. Configure build command: `npm install && npm run build`
4. Configure start command: `npm start`
5. Ensure Excel file is included in repository
6. Set PORT environment variable if required

### Frontend Deployment (Vercel/Netlify)

1. Push code to GitHub repository
2. Connect repository to hosting platform
3. Set build command: `npm run build`
4. Set output directory: `.next`
5. Update API_BASE_URL to production backend URL

## Development Commands

### Backend
```bash
npm run dev      # Start development server with nodemon
npm run build    # Compile TypeScript to JavaScript
npm start        # Run production build
```

### Frontend
```bash
npm run dev      # Start Next.js development server
npm run build    # Create production build
npm start        # Run production server
npm run lint     # Run ESLint
```

## Testing

### Manual Testing Checklist

**Backend:**
- [ ] Excel file loads successfully
- [ ] Initial scraping completes
- [ ] API endpoints return valid JSON
- [ ] Cache stores and retrieves data
- [ ] Background scraper runs on schedule
- [ ] Error handling works for failed scrapes

**Frontend:**
- [ ] Portfolio table displays all 11 columns
- [ ] Gain/loss colors show correctly (green/red)
- [ ] Auto-refresh updates data every 15 seconds
- [ ] Sector summary displays accurate totals
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Loading states display properly

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Known Limitations

1. **Symbol Coverage:** Currently 8 out of 29 stocks successfully fetching prices from Yahoo Finance
2. **No Database:** Portfolio data stored only in Excel file, no historical tracking
3. **Single User:** No authentication or multi-user support
4. **In-Memory Cache:** Data lost on server restart
5. **Rate Limiting:** No protection against external API rate limits
6. **Scraping Fragility:** Google Finance HTML structure may change

## Future Enhancements

- PostgreSQL database for persistent storage and historical data
- User authentication and multiple portfolio support
- Email alerts for price targets
- Portfolio performance charts over time
- Export functionality (PDF/CSV)
- Improved symbol coverage (all 29 stocks)
- Redis cache for multi-server deployment
- WebSocket support for real-time updates
- Unit and integration tests
- Docker containerization

## Contributing

This is an assignment project. For improvements or bug fixes:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request with clear description

## License

This project is created for educational and interview purposes.

## Author

Shubham Sharma

## Acknowledgments

- Yahoo Finance for market price data
- Google Finance for P/E ratios and earnings data
- TanStack for React Table library
- Recharts for visualization components
- Next.js team for the framework

## Contact

For questions or feedback regarding this project, please reach out through GitHub issues or repository contact information.