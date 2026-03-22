const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const propertiesRouter = require('./routes/properties');
const analyticsRouter = require('./routes/analytics');
const alertsRouter = require('./routes/alerts');
const pipelineRouter = require('./routes/pipeline');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API routes
app.use('/api/properties', propertiesRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/pipeline', pipelineRouter);

// Health check
app.get('/api/health', (req, res) => {
  const stats = db.prepare('SELECT COUNT(*) as count FROM properties').get();
  res.json({ status: 'ok', properties: stats.count, timestamp: new Date().toISOString() });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Initialize DB and start
db.exec('PRAGMA journal_mode=WAL');
const HOST = process.env.HOST || '0.0.0.0';
console.log(`Foreclosure Data Aggregator running on http://${HOST}:${PORT}`);
app.listen(PORT, HOST);

module.exports = app;
