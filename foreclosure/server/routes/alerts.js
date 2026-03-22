const express = require('express');
const router = express.Router();
const db = require('../db');

// Create alert
router.post('/', (req, res) => {
  try {
    const { name, email, filters } = req.body;
    if (!name || !filters) return res.status(400).json({ error: 'name and filters required' });

    const result = db.prepare(
      'INSERT INTO alerts (name, email, filters) VALUES (?, ?, ?)'
    ).run(name, email || null, JSON.stringify(filters));

    res.status(201).json({ id: result.lastInsertRowid, name, email, filters, active: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List alerts
router.get('/', (req, res) => {
  try {
    const alerts = db.prepare('SELECT * FROM alerts WHERE active = 1 ORDER BY created_at DESC').all();
    alerts.forEach(a => a.filters = JSON.parse(a.filters));
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete alert
router.delete('/:id', (req, res) => {
  try {
    db.prepare('UPDATE alerts SET active = 0 WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
