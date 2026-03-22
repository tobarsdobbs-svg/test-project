/**
 * Base scraper class for county/source data collection.
 * Each data source implements its own scraper extending this base.
 */
class BaseScraper {
  constructor(sourceName, db) {
    this.sourceName = sourceName;
    this.db = db;
    this.stats = { fetched: 0, new: 0, updated: 0, errors: 0 };
  }

  async run() {
    const runId = this.logStart();
    try {
      const records = await this.fetch();
      this.stats.fetched = records.length;

      for (const record of records) {
        try {
          const normalized = this.normalize(record);
          if (!this.validate(normalized)) {
            this.stats.errors++;
            continue;
          }
          const result = this.upsert(normalized);
          if (result.changes > 0) {
            result.lastInsertRowid ? this.stats.new++ : this.stats.updated++;
          }
        } catch (err) {
          this.stats.errors++;
          console.error(`[${this.sourceName}] Record error:`, err.message);
        }
      }

      this.logComplete(runId, 'completed');
      return this.stats;
    } catch (err) {
      this.logComplete(runId, 'failed', err.message);
      throw err;
    }
  }

  // Override in subclass: fetch raw records from the source
  async fetch() {
    throw new Error('fetch() must be implemented by subclass');
  }

  // Override in subclass: normalize raw record to our schema
  normalize(rawRecord) {
    throw new Error('normalize() must be implemented by subclass');
  }

  validate(record) {
    return record.address && record.city && record.state && record.source;
  }

  upsert(data) {
    const stmt = this.db.prepare(`
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
        address=excluded.address, city=excluded.city, listing_price=excluded.listing_price,
        auction_date=excluded.auction_date, auction_min_bid=excluded.auction_min_bid,
        foreclosure_stage=excluded.foreclosure_stage, updated_at=datetime('now')
    `);
    return stmt.run({
      source: data.source, source_id: data.source_id, address: data.address,
      city: data.city, state: data.state, zip: data.zip || null,
      county: data.county || null, latitude: data.latitude || null,
      longitude: data.longitude || null, property_type: data.property_type || null,
      bedrooms: data.bedrooms || null, bathrooms: data.bathrooms || null,
      sqft: data.sqft || null, lot_size: data.lot_size || null,
      year_built: data.year_built || null, assessed_value: data.assessed_value || null,
      estimated_value: data.estimated_value || null, listing_price: data.listing_price || null,
      auction_date: data.auction_date || null, auction_min_bid: data.auction_min_bid || null,
      foreclosure_stage: data.foreclosure_stage || 'unknown',
      filing_date: data.filing_date || null, default_amount: data.default_amount || null,
      lender: data.lender || null, trustee: data.trustee || null,
      case_number: data.case_number || null, description: data.description || null,
      image_url: data.image_url || null,
    });
  }

  logStart() {
    const result = this.db.prepare(
      'INSERT INTO pipeline_runs (source, status) VALUES (?, ?)'
    ).run(this.sourceName, 'running');
    return result.lastInsertRowid;
  }

  logComplete(runId, status, errors) {
    this.db.prepare(`
      UPDATE pipeline_runs SET status=?, records_fetched=?, records_new=?,
        records_updated=?, errors=?, completed_at=datetime('now') WHERE id=?
    `).run(status, this.stats.fetched, this.stats.new, this.stats.updated, errors || null, runId);
  }
}

module.exports = BaseScraper;
