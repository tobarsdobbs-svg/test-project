# ForeclosureIQ - Foreclosure Data Aggregation Platform

A full-stack foreclosure data aggregation platform that collects public records from county recorders, HUD, and court systems, providing investment analytics, ROI calculations, and market intelligence.

## Features

- **Multi-Source Data Pipeline**: Aggregates from county recorder offices, HUD HomeStore, court filings, and more
- **Advanced Search**: Filter by state, city, ZIP, foreclosure stage, property type, price range, beds/baths
- **Interactive Map**: Leaflet-based map with color-coded markers by foreclosure stage
- **Analytics Dashboard**: Market trends, state/county breakdowns, stage distribution charts
- **Best Deals Finder**: Automatically ranks properties by discount from estimated value
- **Auction Calendar**: Upcoming auctions with countdown timers
- **ROI Calculator**: Full flip and rental analysis with cap rate, cash-on-cash, GRM
- **Investment Analysis**: Automatic discount, rehab, ARV, and profit estimates per property
- **Lien Tracking**: View all liens/encumbrances on a property with total exposure
- **Foreclosure Timeline**: Track properties through the full foreclosure lifecycle
- **Comparable Sales**: Nearby recent sales with distance and price data
- **Saved Alerts**: Create custom alerts with filter criteria
- **Pipeline Monitoring**: Track data source health and pipeline run history

## Architecture

```
County Records ─→ Scrapers ─→ ETL Pipeline ─→ SQLite DB
HUD API ─────────→                              ↓
Court Filings ───→                         Express API
                                                ↓
                                    Frontend (Vanilla JS + Leaflet)
```

## Quick Start

```bash
cd foreclosure
npm install
npm run seed     # Generate 500 demo properties
npm start        # Start server on http://localhost:3000
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/properties` | Search with filters |
| `GET /api/properties/:id` | Full property detail |
| `POST /api/properties/roi` | ROI calculator |
| `GET /api/analytics/stats` | Dashboard statistics |
| `GET /api/analytics/trends/:state` | State market trends |
| `GET /api/analytics/deals` | Best deals ranked |
| `GET /api/analytics/auctions` | Upcoming auctions |
| `GET /api/analytics/risk/:zip` | ZIP code risk score |
| `GET /api/analytics/heatmap` | Heatmap data points |
| `POST /api/alerts` | Create saved alert |
| `GET /api/pipeline/sources` | Data source status |

## Data Pipeline

Run the pipeline to collect data:
```bash
npm run pipeline:run                    # All sources
node pipeline/run.js --source=hud      # HUD only
node pipeline/run.js --source=counties # Counties only
```

### Adding a New County Source

1. Add county config to `server/scrapers/county-scraper.js` COUNTY_CONFIGS
2. Implement the fetch method for the county's record system
3. Run the pipeline

## Tech Stack

- **Backend**: Node.js, Express, better-sqlite3
- **Frontend**: Vanilla JS, Leaflet maps, CSS custom properties
- **Pipeline**: Extensible scraper architecture with Cheerio + Axios
- **Data**: SQLite with WAL mode for concurrent read/write
