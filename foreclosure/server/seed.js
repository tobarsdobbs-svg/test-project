/**
 * Seeds the database with realistic demo data for development/testing.
 */
const db = require('./db');

const STAGES = ['pre_foreclosure', 'auction', 'reo'];
const TYPES = ['single_family', 'condo', 'townhouse', 'multi_family'];
const LENDERS = ['Wells Fargo', 'Bank of America', 'JPMorgan Chase', 'Citibank', 'US Bank',
  'PNC Bank', 'Truist', 'Capital One', 'TD Bank', 'Flagstar Bank', 'Nationstar Mortgage',
  'PHH Mortgage', 'NewRez', 'Mr. Cooper', 'Rocket Mortgage'];
const TRUSTEES = ['Quality Loan Service', 'NBS Default Services', 'Barrett Daffin',
  'Aldridge Pite', 'McCarthy Holthus', 'Shapiro & Ingle'];

const CITIES = [
  { city: 'Phoenix', state: 'AZ', county: 'Maricopa', lat: 33.45, lng: -112.07, zip: '85001' },
  { city: 'Scottsdale', state: 'AZ', county: 'Maricopa', lat: 33.49, lng: -111.93, zip: '85251' },
  { city: 'Mesa', state: 'AZ', county: 'Maricopa', lat: 33.42, lng: -111.83, zip: '85201' },
  { city: 'Tucson', state: 'AZ', county: 'Pima', lat: 32.22, lng: -110.97, zip: '85701' },
  { city: 'Los Angeles', state: 'CA', county: 'Los Angeles', lat: 34.05, lng: -118.24, zip: '90001' },
  { city: 'San Diego', state: 'CA', county: 'San Diego', lat: 32.72, lng: -117.16, zip: '92101' },
  { city: 'Sacramento', state: 'CA', county: 'Sacramento', lat: 38.58, lng: -121.49, zip: '95814' },
  { city: 'Riverside', state: 'CA', county: 'Riverside', lat: 33.98, lng: -117.38, zip: '92501' },
  { city: 'Las Vegas', state: 'NV', county: 'Clark', lat: 36.17, lng: -115.14, zip: '89101' },
  { city: 'Henderson', state: 'NV', county: 'Clark', lat: 36.04, lng: -114.98, zip: '89002' },
  { city: 'Miami', state: 'FL', county: 'Miami-Dade', lat: 25.76, lng: -80.19, zip: '33101' },
  { city: 'Orlando', state: 'FL', county: 'Orange', lat: 28.54, lng: -81.38, zip: '32801' },
  { city: 'Tampa', state: 'FL', county: 'Hillsborough', lat: 27.95, lng: -82.46, zip: '33601' },
  { city: 'Jacksonville', state: 'FL', county: 'Duval', lat: 30.33, lng: -81.66, zip: '32099' },
  { city: 'Houston', state: 'TX', county: 'Harris', lat: 29.76, lng: -95.37, zip: '77001' },
  { city: 'Dallas', state: 'TX', county: 'Dallas', lat: 32.78, lng: -96.80, zip: '75201' },
  { city: 'San Antonio', state: 'TX', county: 'Bexar', lat: 29.42, lng: -98.49, zip: '78201' },
  { city: 'Austin', state: 'TX', county: 'Travis', lat: 30.27, lng: -97.74, zip: '78701' },
  { city: 'Atlanta', state: 'GA', county: 'Fulton', lat: 33.75, lng: -84.39, zip: '30301' },
  { city: 'Chicago', state: 'IL', county: 'Cook', lat: 41.88, lng: -87.63, zip: '60601' },
  { city: 'Detroit', state: 'MI', county: 'Wayne', lat: 42.33, lng: -83.05, zip: '48201' },
  { city: 'Cleveland', state: 'OH', county: 'Cuyahoga', lat: 41.50, lng: -81.69, zip: '44101' },
  { city: 'Columbus', state: 'OH', county: 'Franklin', lat: 39.96, lng: -82.99, zip: '43201' },
  { city: 'Charlotte', state: 'NC', county: 'Mecklenburg', lat: 35.23, lng: -80.84, zip: '28201' },
  { city: 'Denver', state: 'CO', county: 'Denver', lat: 39.74, lng: -104.99, zip: '80201' },
  { city: 'Seattle', state: 'WA', county: 'King', lat: 47.61, lng: -122.33, zip: '98101' },
  { city: 'Portland', state: 'OR', county: 'Multnomah', lat: 45.52, lng: -122.68, zip: '97201' },
  { city: 'Philadelphia', state: 'PA', county: 'Philadelphia', lat: 39.95, lng: -75.17, zip: '19101' },
  { city: 'Baltimore', state: 'MD', county: 'Baltimore City', lat: 39.29, lng: -76.61, zip: '21201' },
  { city: 'Memphis', state: 'TN', county: 'Shelby', lat: 35.15, lng: -90.05, zip: '38101' },
];

const STREETS = [
  'Main St', 'Oak Ave', 'Elm Dr', 'Maple Ln', 'Cedar Blvd', 'Pine Way',
  'Washington Ave', 'Lincoln Dr', 'Park Blvd', 'Lake St', 'Hill Rd',
  'Sunset Dr', 'Meadow Ln', 'River Rd', 'Spring St', 'Valley View Dr',
  'Highland Ave', 'Forest Dr', 'Mountain View Rd', 'Lakewood Blvd',
];

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function jitter(val, range) { return val + (Math.random() - 0.5) * range; }

function futureDate(minDays, maxDays) {
  const d = new Date();
  d.setDate(d.getDate() + rand(minDays, maxDays));
  return d.toISOString().split('T')[0];
}

function pastDate(minDays, maxDays) {
  const d = new Date();
  d.setDate(d.getDate() - rand(minDays, maxDays));
  return d.toISOString().split('T')[0];
}

console.log('Seeding database...');

const insertProp = db.prepare(`
  INSERT OR IGNORE INTO properties (source, source_id, address, city, state, zip, county,
    latitude, longitude, property_type, bedrooms, bathrooms, sqft, lot_size,
    year_built, assessed_value, estimated_value, listing_price, auction_date,
    auction_min_bid, foreclosure_stage, filing_date, default_amount, lender,
    trustee, case_number, description, image_url, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertTimeline = db.prepare(`
  INSERT INTO property_timeline (property_id, stage, event_date, details, source)
  VALUES (?, ?, ?, ?, ?)
`);

const insertLien = db.prepare(`
  INSERT INTO liens (property_id, lien_type, amount, holder, recording_date, position, status)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const insertComp = db.prepare(`
  INSERT INTO comparables (property_id, comp_address, sale_price, sale_date, sqft, distance_miles)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const insertAll = db.transaction(() => {
  const NUM_PROPERTIES = 500;

  for (let i = 0; i < NUM_PROPERTIES; i++) {
    const location = pick(CITIES);
    const stage = pick(STAGES);
    const type = pick(TYPES);
    const beds = type === 'condo' ? rand(1, 3) : rand(2, 5);
    const baths = beds <= 2 ? rand(1, 2) : rand(2, 4);
    const sqft = beds * rand(400, 800);
    const yearBuilt = rand(1950, 2020);
    const estimatedValue = rand(80000, 850000);
    const discount = rand(15, 55) / 100;
    const listingPrice = Math.round(estimatedValue * (1 - discount));
    const assessedValue = Math.round(estimatedValue * 0.85);
    const streetNum = rand(100, 9999);
    const address = `${streetNum} ${pick(STREETS)}`;
    const zip = (parseInt(location.zip) + rand(0, 99)).toString().padStart(5, '0');

    const sourceId = `${location.state}-${location.county.substring(0,3).toUpperCase()}-${(100000 + i).toString()}`;
    const source = Math.random() > 0.3 ? 'county_records' : (Math.random() > 0.5 ? 'hud_homestore' : 'court_filing');

    const auctionDate = stage === 'auction' ? futureDate(1, 60) :
                        (stage === 'pre_foreclosure' ? futureDate(30, 120) : null);
    const filingDate = pastDate(30, 365);

    const result = insertProp.run(
      source, sourceId, address, location.city, location.state, zip, location.county,
      jitter(location.lat, 0.15), jitter(location.lng, 0.15),
      type, beds, baths, sqft, (sqft * rand(2, 8) / 1000).toFixed(2),
      yearBuilt, assessedValue, estimatedValue, listingPrice, auctionDate,
      stage === 'auction' ? Math.round(listingPrice * 0.9) : null,
      stage, filingDate, Math.round(estimatedValue * rand(60, 95) / 100),
      pick(LENDERS), stage === 'auction' ? pick(TRUSTEES) : null,
      `${location.state.toUpperCase()}-${rand(2023, 2026)}-FC-${rand(10000, 99999)}`,
      `${type.replace('_', ' ')} in ${location.city}. ${beds}bd/${baths}ba, ${sqft} sqft. Built ${yearBuilt}.`,
      null,
      pastDate(1, 90)
    );

    const propId = result.lastInsertRowid;
    if (!propId) continue;

    // Timeline events
    insertTimeline.run(propId, 'pre_foreclosure', filingDate,
      'Notice of Default filed', source);
    if (stage === 'auction' || stage === 'reo') {
      insertTimeline.run(propId, 'auction', pastDate(1, 30),
        'Trustee sale scheduled', source);
    }
    if (stage === 'reo') {
      insertTimeline.run(propId, 'reo', pastDate(1, 14),
        'Property reverted to lender', source);
    }

    // Liens
    insertLien.run(propId, 'mortgage', Math.round(estimatedValue * rand(60, 95) / 100),
      pick(LENDERS), pastDate(365, 3650), 1, 'active');
    if (Math.random() > 0.6) {
      insertLien.run(propId, 'tax', rand(1000, 15000),
        `${location.county} County Tax`, pastDate(30, 365), 2, 'active');
    }
    if (Math.random() > 0.8) {
      insertLien.run(propId, 'hoa', rand(500, 8000),
        'HOA', pastDate(30, 180), 3, 'active');
    }

    // Comparables
    for (let c = 0; c < rand(2, 5); c++) {
      insertComp.run(propId,
        `${rand(100, 9999)} ${pick(STREETS)}`,
        Math.round(estimatedValue * (0.8 + Math.random() * 0.4)),
        pastDate(30, 365),
        sqft + rand(-200, 200),
        (Math.random() * 3).toFixed(1)
      );
    }
  }
});

insertAll();

const count = db.prepare('SELECT COUNT(*) as c FROM properties').get().c;
console.log(`Seeded ${count} properties with timeline, liens, and comparables.`);
