const BaseScraper = require('../../pipeline/base-scraper');

/**
 * Generic county records scraper template.
 * Each county has different systems - this provides the pattern.
 *
 * Common county record systems:
 * - Tyler Technologies (Odyssey) - used by many TX, FL counties
 * - Aumentum / Thomson Reuters - property tax systems
 * - Granicus / Legistar - for court records
 * - Custom county portals
 *
 * Data available from county records:
 * - Notice of Default (NOD) filings
 * - Lis Pendens filings
 * - Notice of Trustee Sale (NOTS)
 * - Auction schedules and results
 * - Property tax delinquencies
 * - Ownership transfers / deeds
 */
class CountyScraper extends BaseScraper {
  constructor(db, countyConfig) {
    super(`county_${countyConfig.fips}`, db);
    this.config = countyConfig;
  }

  async fetch() {
    const { system, baseUrl, county, state, fips } = this.config;

    console.log(`[County:${county},${state}] Fetching from ${system} system at ${baseUrl}`);

    // Each county system needs its own fetch implementation
    switch (system) {
      case 'tyler_odyssey':
        return this.fetchTylerOdyssey();
      case 'aumentum':
        return this.fetchAumentum();
      case 'custom':
        return this.fetchCustomPortal();
      default:
        console.warn(`[County:${county}] Unknown system: ${system}`);
        return [];
    }
  }

  async fetchTylerOdyssey() {
    // Tyler Odyssey is used by many courts for case management
    // Would search for foreclosure case types
    // GET /CaseSearch with caseType=foreclosure
    return [];
  }

  async fetchAumentum() {
    // Aumentum handles property tax and assessment data
    // Would search for tax-delinquent properties
    return [];
  }

  async fetchCustomPortal() {
    // Many counties have custom-built portals
    // Would use Cheerio to parse HTML listings
    return [];
  }

  normalize(raw) {
    return {
      source: this.sourceName,
      source_id: raw.document_number || raw.case_number,
      address: raw.property_address || raw.situs_address,
      city: raw.city || this.config.county,
      state: this.config.state,
      zip: raw.zip,
      county: this.config.county,
      latitude: raw.latitude,
      longitude: raw.longitude,
      property_type: raw.property_type || 'unknown',
      assessed_value: parseFloat(raw.assessed_value) || null,
      estimated_value: parseFloat(raw.market_value) || null,
      auction_date: raw.sale_date || raw.auction_date,
      auction_min_bid: parseFloat(raw.opening_bid || raw.min_bid) || null,
      foreclosure_stage: this.mapStage(raw.document_type || raw.filing_type),
      filing_date: raw.recording_date || raw.filing_date,
      default_amount: parseFloat(raw.default_amount || raw.unpaid_balance) || null,
      lender: raw.beneficiary || raw.lender || raw.plaintiff,
      trustee: raw.trustee,
      case_number: raw.case_number,
    };
  }

  mapStage(docType) {
    if (!docType) return 'unknown';
    const lower = docType.toLowerCase();
    if (lower.includes('default') || lower.includes('lis pendens')) return 'pre_foreclosure';
    if (lower.includes('sale') || lower.includes('auction') || lower.includes('trustee')) return 'auction';
    if (lower.includes('reo') || lower.includes('bank owned') || lower.includes('deed')) return 'reo';
    return 'pre_foreclosure';
  }
}

// Known county configurations (expandable)
const COUNTY_CONFIGS = [
  { fips: '06037', county: 'Los Angeles', state: 'CA', system: 'custom', baseUrl: 'https://registrar.lacounty.gov' },
  { fips: '06073', county: 'San Diego', state: 'CA', system: 'custom', baseUrl: 'https://arcc.sdcounty.ca.gov' },
  { fips: '12086', county: 'Miami-Dade', state: 'FL', system: 'tyler_odyssey', baseUrl: 'https://www2.miami-dadeclerk.com' },
  { fips: '48201', county: 'Harris', state: 'TX', system: 'custom', baseUrl: 'https://www.cclerk.hctx.net' },
  { fips: '04013', county: 'Maricopa', state: 'AZ', system: 'custom', baseUrl: 'https://recorder.maricopa.gov' },
  { fips: '32003', county: 'Clark', state: 'NV', system: 'custom', baseUrl: 'https://recorder.clarkcountynv.gov' },
  { fips: '17031', county: 'Cook', state: 'IL', system: 'custom', baseUrl: 'https://www.cookcountyclerkofcourt.org' },
  { fips: '36061', county: 'New York', state: 'NY', system: 'custom', baseUrl: 'https://a836-acris.nyc.gov' },
  { fips: '13121', county: 'Fulton', state: 'GA', system: 'tyler_odyssey', baseUrl: 'https://publicrecords.fultoncountyga.gov' },
  { fips: '26163', county: 'Wayne', state: 'MI', system: 'custom', baseUrl: 'https://www.waynecountylandrecords.com' },
];

module.exports = { CountyScraper, COUNTY_CONFIGS };
