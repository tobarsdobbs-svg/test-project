const express = require('express');
const router = express.Router();
const Property = require('../models/Property');

// Search properties
router.get('/', (req, res) => {
  try {
    const results = Property.search(req.query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get property by ID with full details
router.get('/:id', (req, res) => {
  try {
    const property = Property.getById(req.params.id);
    if (!property) return res.status(404).json({ error: 'Property not found' });

    // Calculate investment metrics
    property.investment = calculateInvestment(property);
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Nearby properties
router.get('/:id/nearby', (req, res) => {
  try {
    const property = Property.getById(req.params.id);
    if (!property) return res.status(404).json({ error: 'Property not found' });
    const radius = parseFloat(req.query.radius) || 5;
    const nearby = Property.nearbyProperties(property.latitude, property.longitude, radius, 20);
    res.json(nearby.filter(p => p.id !== property.id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ROI Calculator
router.post('/roi', (req, res) => {
  try {
    const { purchasePrice, rehabCost, afterRepairValue, holdingMonths,
            monthlyRent, propertyTax, insurance, maintenance, vacancy } = req.body;

    const totalInvestment = purchasePrice + (rehabCost || 0);
    const holdMonths = holdingMonths || 6;

    // Flip analysis
    const flipProfit = (afterRepairValue || purchasePrice * 1.3) - totalInvestment;
    const flipROI = (flipProfit / totalInvestment) * 100;

    // Rental analysis
    const annualRent = (monthlyRent || 0) * 12;
    const annualExpenses = (propertyTax || purchasePrice * 0.012) +
      (insurance || 1200) + (maintenance || annualRent * 0.1) +
      (annualRent * ((vacancy || 8) / 100));
    const annualNOI = annualRent - annualExpenses;
    const capRate = totalInvestment > 0 ? (annualNOI / totalInvestment) * 100 : 0;
    const cashOnCash = totalInvestment > 0 ? (annualNOI / totalInvestment) * 100 : 0;
    const grm = monthlyRent > 0 ? totalInvestment / annualRent : 0;

    res.json({
      totalInvestment,
      flip: { profit: flipProfit, roi: flipROI, holdingMonths: holdMonths },
      rental: { monthlyNOI: annualNOI / 12, annualNOI, capRate, cashOnCash, grm },
      breakEven: annualNOI > 0 ? totalInvestment / annualNOI : null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function calculateInvestment(property) {
  const price = property.listing_price || property.auction_min_bid || 0;
  const value = property.estimated_value || 0;
  if (!price || !value) return null;

  const discount = ((value - price) / value) * 100;
  const estimatedRehab = price * 0.15; // rough 15% estimate
  const arv = value * 1.05;
  const flipProfit = arv - price - estimatedRehab;

  return {
    purchasePrice: price,
    estimatedValue: value,
    discountPercent: Math.round(discount * 10) / 10,
    estimatedRehab: Math.round(estimatedRehab),
    arv: Math.round(arv),
    estimatedFlipProfit: Math.round(flipProfit),
    estimatedFlipROI: Math.round((flipProfit / (price + estimatedRehab)) * 100 * 10) / 10,
  };
}

module.exports = router;
