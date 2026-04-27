const express = require('express');
const { Game, Anomaly, DetectedAnomaly } = require('../models');

const router = express.Router();

// Get all games
router.get('/', async (req, res) => {
  try {
    const games = await Game.findAll();
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new game
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const game = await Game.create({ name, description });
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get game by ID with anomalies
router.get('/:id', async (req, res) => {
  try {
    const game = await Game.findByPk(req.params.id, {
      include: [Anomaly, DetectedAnomaly]
    });
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    res.json(game);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;