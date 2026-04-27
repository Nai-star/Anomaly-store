const express = require('express');
const { Anomaly, DetectedAnomaly } = require('../models');

const router = express.Router();

// Get all anomalies
router.get('/', async (req, res) => {
  try {
    const anomalies = await Anomaly.findAll();
    res.json(anomalies);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new anomaly
router.post('/', async (req, res) => {
  try {
    const { gameId, type, description } = req.body;
    const anomaly = await Anomaly.create({ gameId, type, description });
    res.status(201).json(anomaly);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Detect anomaly
router.post('/detect', async (req, res) => {
  try {
    const { anomalyId, userId, confidence } = req.body;
    const detected = await DetectedAnomaly.create({
      anomalyId,
      userId,
      confidence,
      detectedAt: new Date()
    });
    res.status(201).json(detected);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;