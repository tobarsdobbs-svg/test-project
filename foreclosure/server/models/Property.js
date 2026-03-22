const db = require('../db');

const Property = {
  search({ state, city, zip, county, stage, minPrice, maxPrice, propertyType,
           minBeds, minBaths, minSqft, auctionBefore, sort, order, limit, offset }) {
    const conditions = [];
    const params = {};

    if (state) { conditions.push('state = $state'); params.state = state; }
    if (city) { conditions.push('city LIKE $city'); params.city = `%${city}%`; }
    if (zip) { conditions.push('zip = $zip'); params.zip = zip; }
    if (county) { conditions.push('county LIKE $county'); params.county = `%${county}%`; }
    if (stage) { conditions.push('foreclosure_stage = $stage'); params.stage = stage; }
    if (propertyType) { conditions.push('property_type = $type'); params.type = propertyType; }
    if (minPrice) { conditions.push('(listing_price >= $minPrice OR auction_min_bid >= $minPrice)'); params.minPrice = minPrice; }
    if (maxPrice) { conditions.push('(listing_price <= $maxPrice OR auction_min_bid <= $maxPrice)'); params.maxPrice = maxPrice; }
    if (minBeds) { conditions.push('bedrooms >= $minBeds'); params.minBeds = minBeds; }
    if (minBaths) { conditions.push('bathrooms >= $minBaths'); params.minBaths = minBaths; }
    if (minSqft) { conditions.push('sqft >= $minSqft'); params.minSqft = minSqft; }
    if (auctionBefore) { conditions.push('auction_date <= $auctionBefore'); params.auctionBefore = auctionBefore; }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const validSorts = ['listing_price', 'auction_date', 'created_at', 'sqft', 'estimated_value'];
    const sortCol = validSorts.includes(sort) ? sort : 'created_at';
    const sortDir = order === 'ASC' ? 'ASC' : 'DESC';
    const lim = Math.min(parseInt(limit) || 50, 200);
    const off = parseInt(offset) || 0;

    const countStmt = db.prepare(`SELECT COUNT(*) as total FROM properties ${where}`);
    const total = countStmt.get(params).total;

    const stmt = db.prepare(`SELECT * FROM properties ${where} ORDER BY ${sortCol} ${sortDir} LIMIT ${lim} OFFSET ${off}`);
    const results = stmt.all(params);

    return { total, limit: lim, offset: off, results };
  },

  getById(id) {
    const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(id);
    if (!property) return null;

    property.timeline = db.prepare(
      'SELECT * FROM property_timeline WHERE property_id = ? ORDER BY event_date DESC'
    ).all(id);

    property.liens = db.prepare(
      'SELECT * FROM liens WHERE property_id = ? ORDER BY position ASC'
    ).all(id);

    property.comparables = db.prepare(
      'SELECT * FROM comparables WHERE property_id = ? ORDER BY distance_miles ASC'
    ).all(id);

    return property;
  },

  upsert(data) {
    const stmt = db.prepare(`
      INSERT INTO properties (source, source_id, address, city, state, zip, county,
        latitude, longitude, property_type, bedrooms, bathrooms, sqft, lot_size,
        year_built, assessed_value, estimated_value, listing_price, auction_date,
        auction_min_bid, foreclosure_stage, filing_date, default_amount, lender,
        trustee, case_number, description, image_url, updated_at)
      VALUES ($source, $source_id, $address, $city, $state, $zip, $county,
        $latitude, $longitude, $property_type, $bedrooms, $bathrooms, $sqft, $lot_size,
        $year_built, $assessed_value, $estimated_value, $listing_price, $auction_date,
        $auction_min_bid, $foreclosure_stage, $filing_date, $default_amount, $lender,
        $trustee, $case_number, $description, $image_url, datetime('now'))
      ON CONFLICT(source, source_id) DO UPDATE SET
        address=excluded.address, city=excluded.city, state=excluded.state,
        zip=excluded.zip, county=excluded.county, latitude=excluded.latitude,
        longitude=excluded.longitude, property_type=excluded.property_type,
        bedrooms=excluded.bedrooms, bathrooms=excluded.bathrooms, sqft=excluded.sqft,
        lot_size=excluded.lot_size, year_built=excluded.year_built,
        assessed_value=excluded.assessed_value, estimated_value=excluded.estimated_value,
        listing_price=excluded.listing_price, auction_date=excluded.auction_date,
        auction_min_bid=excluded.auction_min_bid, foreclosure_stage=excluded.foreclosure_stage,
        filing_date=excluded.filing_date, default_amount=excluded.default_amount,
        lender=excluded.lender, trustee=excluded.trustee, case_number=excluded.case_number,
        description=excluded.description, image_url=excluded.image_url,
        updated_at=datetime('now')
    `);
    return stmt.run(data);
  },

  addTimelineEvent(propertyId, stage, eventDate, details, source) {
    return db.prepare(
      'INSERT INTO property_timeline (property_id, stage, event_date, details, source) VALUES (?, ?, ?, ?, ?)'
    ).run(propertyId, stage, eventDate, details, source);
  },

  addLien(propertyId, data) {
    return db.prepare(
      'INSERT INTO liens (property_id, lien_type, amount, holder, recording_date, position, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(propertyId, data.lien_type, data.amount, data.holder, data.recording_date, data.position, data.status || 'active');
  },

  getStats() {
    return {
      total: db.prepare('SELECT COUNT(*) as c FROM properties').get().c,
      byStage: db.prepare('SELECT foreclosure_stage as stage, COUNT(*) as count FROM properties GROUP BY foreclosure_stage').all(),
      byState: db.prepare('SELECT state, COUNT(*) as count FROM properties GROUP BY state ORDER BY count DESC LIMIT 20').all(),
      byType: db.prepare('SELECT property_type as type, COUNT(*) as count FROM properties GROUP BY property_type').all(),
      recentlyAdded: db.prepare("SELECT COUNT(*) as c FROM properties WHERE created_at >= datetime('now', '-7 days')").get().c,
      upcomingAuctions: db.prepare("SELECT COUNT(*) as c FROM properties WHERE auction_date >= date('now') AND auction_date <= date('now', '+30 days')").get().c,
      avgDiscount: db.prepare('SELECT AVG(CASE WHEN estimated_value > 0 AND listing_price > 0 THEN ((estimated_value - listing_price) / estimated_value) * 100 END) as avg FROM properties').get().avg,
    };
  },

  nearbyProperties(lat, lng, radiusMiles, limit) {
    // Approximate bounding box
    const latDelta = radiusMiles / 69.0;
    const lngDelta = radiusMiles / (69.0 * Math.cos(lat * Math.PI / 180));
    return db.prepare(`
      SELECT *,
        (3959 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance
      FROM properties
      WHERE latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?
      ORDER BY distance ASC LIMIT ?
    `).all(lat, lng, lat, lat - latDelta, lat + latDelta, lng - lngDelta, lng + lngDelta, limit || 20);
  }
};

module.exports = Property;
