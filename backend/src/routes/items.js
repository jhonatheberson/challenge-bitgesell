const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// Utility to read data (non-blocking)
async function readData() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // If file doesn't exist, return empty array
      return [];
    }
    throw error;
  }
}

// Utility to write data (non-blocking)
async function writeData(data) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// GET /api/items
router.get('/', async (req, res, next) => {
  try {
    const data = await readData();
    const { page = 1, limit = 10, q } = req.query;

    let results = data;

    // Apply search filter if query parameter exists
    if (q) {
      results = results.filter(item =>
        item.name.toLowerCase().includes(q.toLowerCase()) ||
        item.category.toLowerCase().includes(q.toLowerCase())
      );
    }

    // Parse and validate pagination parameters
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);

    if (isNaN(parsedPage) || parsedPage < 1) {
      return res.status(400).json({ error: 'Invalid page parameter' });
    }

    if (isNaN(parsedLimit) || parsedLimit < 1) {
      return res.status(400).json({ error: 'Invalid limit parameter' });
    }

    // Calculate pagination
    const totalItems = results.length;
    const totalPages = Math.ceil(totalItems / parsedLimit);
    const startIndex = (parsedPage - 1) * parsedLimit;
    const endIndex = startIndex + parsedLimit;

    // Get paginated results
    const paginatedResults = results.slice(startIndex, endIndex);

    // Return paginated response with metadata
    res.json({
      data: paginatedResults,
      pagination: {
        currentPage: parsedPage,
        totalPages,
        totalItems,
        itemsPerPage: parsedLimit,
        hasNextPage: parsedPage < totalPages,
        hasPreviousPage: parsedPage > 1
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const data = await readData();
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID parameter' });
    }

    const item = data.find(i => i.id === id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post('/', async (req, res, next) => {
  try {
    const item = req.body;

    // Comprehensive validation
    const validationErrors = [];

    // Name validation
    if (!item.name) {
      validationErrors.push('Name is required');
    } else if (typeof item.name !== 'string') {
      validationErrors.push('Name must be a string');
    } else if (item.name.trim().length === 0) {
      validationErrors.push('Name cannot be empty');
    }

    // Category validation
    if (!item.category) {
      validationErrors.push('Category is required');
    } else if (typeof item.category !== 'string') {
      validationErrors.push('Category must be a string');
    } else if (item.category.trim().length === 0) {
      validationErrors.push('Category cannot be empty');
    }

    // Price validation
    if (item.price === undefined) {
      validationErrors.push('Price is required');
    } else if (typeof item.price !== 'number') {
      validationErrors.push('Price must be a number');
    } else if (item.price < 0) {
      validationErrors.push('Price cannot be negative');
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors
      });
    }

    const data = await readData();
    item.id = Date.now();
    data.push(item);

    await writeData(data);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
