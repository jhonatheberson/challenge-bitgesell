const express = require('express');
const router = express.Router();
const cacheMiddleware = require('../middleware/cache');
const { readData } = require('../utils/fileUtils');
const fs = require('fs').promises;
const path = require('path');

const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// GET /api/stats
router.get('/', cacheMiddleware('stats'), async (req, res, next) => {
  try {
    const items = await readData();
    const fileStats = await fs.stat(DATA_PATH);

    const stats = {
      totalItems: items.length,
      categories: {},
      priceRange: {
        min: Infinity,
        max: -Infinity,
        average: 0
      },
      metadata: {
        lastModified: fileStats.mtime.toISOString(),
        calculatedAt: new Date().toISOString()
      }
    };

    // Calculate statistics
    items.forEach(item => {
      // Category statistics
      if (!stats.categories[item.category]) {
        stats.categories[item.category] = 0;
      }
      stats.categories[item.category]++;

      // Price statistics
      if (item.price < stats.priceRange.min) {
        stats.priceRange.min = item.price;
      }
      if (item.price > stats.priceRange.max) {
        stats.priceRange.max = item.price;
      }
    });

    // Calculate average price
    const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
    stats.priceRange.average = items.length > 0 ? totalPrice / items.length : 0;

    // Convert Infinity to null for better JSON representation
    if (stats.priceRange.min === Infinity) stats.priceRange.min = null;
    if (stats.priceRange.max === -Infinity) stats.priceRange.max = null;

    res.json(stats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
