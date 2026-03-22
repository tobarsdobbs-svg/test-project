const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const db = require('../db');

// Dashboard stats
router.get('/stats', (req, res) => {
  try {
    res.json(Property.getStats());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Market trends by state
router.get('/trends/:state', (req, res) => {
  try {
    const monthly = db.prepare(`
      SELECT strftime('%Y-%m', filing_date) as month, COUNT(*) as filings,
        AVG(listing_price) as avg_price, AVG(estimated_value) as avg_value
      FROM properties
      WHERE state = ? AND filing_date IS NOT NULL
      GROUP BY month ORDER BY month DESC LIMIT 24
    `).all(req.params.state);

    const byCounty = db.prepare(`
      SELECT county, COUNT(*) as count, AVG(listing_price) as avg_price,
        AVG(CASE WHEN estimated_value > 0 AND listing_price > 0
          THEN ((estimated_value - listing_price) / estimated_value) * 100 END) as avg_discount
      FROM properties WHERE state = ? AND county IS NOT NULL
      GROUP BY county ORDER BY count DESC LIMIT 25
    `).all(req.params.state);

    const byStage = db.prepare(`
      SELECT foreclosure_stage as stage, COUNT(*) as count
      FROM properties WHERE state = ?
      GROUP BY foreclosure_stage
    `).all(req.params.state);

    res.json({ state: req.params.state, monthly, byCounty, byStage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Heatmap data
router.get('/heatmap', (req, res) => {
  try {
    const points = db.prepare(`
      SELECT latitude as lat, longitude as lng, COUNT(*) as weight
      FROM properties
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      GROUP BY ROUND(latitude, 2), ROUND(longitude, 2)
    `).all();
    res.json(points);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Best deals - highest discount from estimated value
router.get('/deals', (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const state = req.query.state;
    const where = state ? 'AND state = ?' : '';
    const params = state ? [limit, state] : [limit];

    // Reorder params: state first if present, then limit
    const deals = db.prepare(`
      SELECT *, ((estimated_value - listing_price) / estimated_value) * 100 as discount_pct
      FROM properties
      WHERE estimated_value > 0 AND listing_price > 0 AND listing_price < estimated_value
      ${where}
      ORDER BY discount_pct DESC LIMIT ?
    `).all(state ? [state, limit] : [limit]);

    res.json(deals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upcoming auctions
router.get('/auctions', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const state = req.query.state;
    const conditions = ["auction_date >= date('now')", `auction_date <= date('now', '+${days} days')`];
    const params = {};
    if (state) { conditions.push('state = $state'); params.state = state; }

    const auctions = db.prepare(`
      SELECT * FROM properties
      WHERE ${conditions.join(' AND ')}
      ORDER BY auction_date ASC LIMIT 100
    `).all(params);

    res.json(auctions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Foreclosure risk score for a zip code
router.get('/risk/:zip', (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT COUNT(*) as total_foreclosures,
        SUM(CASE WHEN foreclosure_stage = 'pre_foreclosure' THEN 1 ELSE 0 END) as pre_foreclosure,
        SUM(CASE WHEN foreclosure_stage = 'auction' THEN 1 ELSE 0 END) as auction,
        SUM(CASE WHEN foreclosure_stage = 'reo' THEN 1 ELSE 0 END) as reo,
        AVG(listing_price) as avg_price,
        AVG(CASE WHEN estimated_value > 0 AND listing_price > 0
          THEN ((estimated_value - listing_price) / estimated_value) * 100 END) as avg_discount
      FROM properties WHERE zip = ?
    `).get(req.params.zip);

    // Simple risk score 0-100
    const riskScore = Math.min(100, Math.round(
      (stats.total_foreclosures * 2) +
      (stats.pre_foreclosure * 3) +
      (stats.auction * 5)
    ));

    res.json({ zip: req.params.zip, riskScore, ...stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
