/**
 * Items API Routes
 * Handles CRUD operations for items with pagination and search functionality
 */
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

/**
 * Reads items data from the JSON file
 * @returns {Promise<Array>} Array of items
 * @throws {Error} If file read fails
 */
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

/**
 * Writes items data to the JSON file
 * @param {Array} data - Array of items to write
 * @returns {Promise<void>}
 */
async function writeData(data) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Validates item data
 * @param {Object} item - Item to validate
 * @returns {Array<string>} Array of validation errors
 */
function validateItem(item) {
  const errors = [];

  if (!item.name) {
    errors.push('Name is required');
  } else if (typeof item.name !== 'string') {
    errors.push('Name must be a string');
  } else if (item.name.trim().length === 0) {
    errors.push('Name cannot be empty');
  }

  if (!item.category) {
    errors.push('Category is required');
  } else if (typeof item.category !== 'string') {
    errors.push('Category must be a string');
  } else if (item.category.trim().length === 0) {
    errors.push('Category cannot be empty');
  }

  if (item.price === undefined) {
    errors.push('Price is required');
  } else if (typeof item.price !== 'number') {
    errors.push('Price must be a number');
  } else if (item.price < 0) {
    errors.push('Price cannot be negative');
  }

  return errors;
}

// GET /api/items - List items with pagination and search
router.get('/', async (req, res, next) => {
  try {
    const data = await readData();
    const { page = 1, limit = 10, q } = req.query;

    let results = data;

    // Apply search filter if query parameter exists
    if (q) {
      const searchTerm = q.toLowerCase();
      results = results.filter(item =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm)
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

    // Return paginated response with metadata
    res.json({
      data: results.slice(startIndex, endIndex),
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

// GET /api/items/:id - Get single item by ID
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

// POST /api/items - Create new item
router.post('/', async (req, res, next) => {
  try {
    const item = req.body;
    const validationErrors = validateItem(item);

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
