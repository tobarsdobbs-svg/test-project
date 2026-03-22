const express = require('express');
const router = express.Router();
const db = require('../db');

// Get pipeline run history
router.get('/runs', (req, res) => {
  try {
    const runs = db.prepare(
      'SELECT * FROM pipeline_runs ORDER BY started_at DESC LIMIT 50'
    ).all();
    res.json(runs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get data source status
router.get('/sources', (req, res) => {
  try {
    const sources = db.prepare(`
      SELECT source, COUNT(*) as total_records,
        MAX(updated_at) as last_updated,
        MIN(created_at) as first_record
      FROM properties GROUP BY source
    `).all();
    res.json(sources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
