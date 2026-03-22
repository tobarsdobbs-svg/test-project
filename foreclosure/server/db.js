const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'foreclosures.db');
const fs = require('fs');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,
    source_id TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip TEXT,
    county TEXT,
    latitude REAL,
    longitude REAL,
    property_type TEXT,
    bedrooms INTEGER,
    bathrooms REAL,
    sqft INTEGER,
    lot_size REAL,
    year_built INTEGER,
    assessed_value REAL,
    estimated_value REAL,
    listing_price REAL,
    auction_date TEXT,
    auction_min_bid REAL,
    foreclosure_stage TEXT NOT NULL DEFAULT 'unknown',
    filing_date TEXT,
    default_amount REAL,
    lender TEXT,
    trustee TEXT,
    case_number TEXT,
    description TEXT,
    image_url TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(source, source_id)
  );

  CREATE TABLE IF NOT EXISTS property_timeline (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    stage TEXT NOT NULL,
    event_date TEXT NOT NULL,
    details TEXT,
    source TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (property_id) REFERENCES properties(id)
  );

  CREATE TABLE IF NOT EXISTS liens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    lien_type TEXT NOT NULL,
    amount REAL,
    holder TEXT,
    recording_date TEXT,
    position INTEGER,
    status TEXT DEFAULT 'active',
    FOREIGN KEY (property_id) REFERENCES properties(id)
  );

  CREATE TABLE IF NOT EXISTS comparables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    comp_address TEXT NOT NULL,
    sale_price REAL,
    sale_date TEXT,
    sqft INTEGER,
    distance_miles REAL,
    FOREIGN KEY (property_id) REFERENCES properties(id)
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    filters TEXT NOT NULL,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS pipeline_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'running',
    records_fetched INTEGER DEFAULT 0,
    records_new INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    errors TEXT,
    started_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_properties_state ON properties(state);
  CREATE INDEX IF NOT EXISTS idx_properties_stage ON properties(foreclosure_stage);
  CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
  CREATE INDEX IF NOT EXISTS idx_properties_zip ON properties(zip);
  CREATE INDEX IF NOT EXISTS idx_properties_coords ON properties(latitude, longitude);
  CREATE INDEX IF NOT EXISTS idx_properties_auction ON properties(auction_date);
  CREATE INDEX IF NOT EXISTS idx_timeline_property ON property_timeline(property_id);
  CREATE INDEX IF NOT EXISTS idx_liens_property ON liens(property_id);
`);

module.exports = db;
