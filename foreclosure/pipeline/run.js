/**
 * Pipeline runner - orchestrates data collection from all sources.
 * In production, this would be triggered by cron (node-cron) or a task queue.
 *
 * Usage:
 *   node pipeline/run.js                 # Run all sources
 *   node pipeline/run.js --source=hud    # Run specific source
 */
const db = require('../server/db');
const HUDScraper = require('../server/scrapers/hud-scraper');
const { CountyScraper, COUNTY_CONFIGS } = require('../server/scrapers/county-scraper');

async function runPipeline(sourceFilter) {
  console.log('=== Foreclosure Data Pipeline ===');
  console.log(`Started at: ${new Date().toISOString()}`);
  const results = [];

  // HUD HomeStore
  if (!sourceFilter || sourceFilter === 'hud') {
    console.log('\n--- HUD HomeStore ---');
    try {
      const scraper = new HUDScraper(db);
      const stats = await scraper.run();
      results.push({ source: 'hud', ...stats });
      console.log(`HUD: ${stats.fetched} fetched, ${stats.new} new, ${stats.updated} updated`);
    } catch (err) {
      console.error('HUD failed:', err.message);
      results.push({ source: 'hud', error: err.message });
    }
  }

  // County scrapers
  for (const config of COUNTY_CONFIGS) {
    const sourceKey = `county_${config.fips}`;
    if (sourceFilter && sourceFilter !== 'counties' && sourceFilter !== sourceKey) continue;

    console.log(`\n--- ${config.county} County, ${config.state} ---`);
    try {
      const scraper = new CountyScraper(db, config);
      const stats = await scraper.run();
      results.push({ source: sourceKey, ...stats });
      console.log(`${config.county}: ${stats.fetched} fetched, ${stats.new} new`);
    } catch (err) {
      console.error(`${config.county} failed:`, err.message);
      results.push({ source: sourceKey, error: err.message });
    }
  }

  console.log('\n=== Pipeline Complete ===');
  console.log(JSON.stringify(results, null, 2));
  return results;
}

// CLI invocation
const sourceArg = process.argv.find(a => a.startsWith('--source='));
const source = sourceArg ? sourceArg.split('=')[1] : null;
runPipeline(source).catch(console.error);
