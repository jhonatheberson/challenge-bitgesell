/**
 * Items API Routes
 * Handles CRUD operations for items with pagination and search functionality
 */
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
const { ValidationError, NotFoundError, asyncHandler } = require('../middleware/errorHandler');
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
 * @throws {Error} If write fails
 */
async function writeData(data) {
  try {
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    throw new Error(`Failed to write data: ${error.message}`);
  }
}

/**
 * Validates item data
 * @param {Object} item - Item to validate
 * @throws {ValidationError} If validation fails
 */
function validateItem(item) {
  if (!item || typeof item !== 'object') {
    throw new ValidationError('Invalid item data');
  }

  const errors = [];

  if (!item.name) {
    errors.push('Name is required');
  } else if (typeof item.name !== 'string') {
    errors.push('Name must be a string');
  } else if (item.name.trim().length === 0) {
    errors.push('Name cannot be empty');
  } else if (item.name.length > 100) {
    errors.push('Name must be less than 100 characters');
  }

  if (!item.category) {
    errors.push('Category is required');
  } else if (typeof item.category !== 'string') {
    errors.push('Category must be a string');
  } else if (item.category.trim().length === 0) {
    errors.push('Category cannot be empty');
  } else if (item.category.length > 50) {
    errors.push('Category must be less than 50 characters');
  }

  if (item.price === undefined) {
    errors.push('Price is required');
  } else if (typeof item.price !== 'number') {
    errors.push('Price must be a number');
  } else if (item.price < 0) {
    errors.push('Price cannot be negative');
  } else if (item.price > 1000000) {
    errors.push('Price must be less than 1,000,000');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(', '));
  }
}

// GET /api/items - List items with pagination and search
router.get('/', asyncHandler(async (req, res) => {
  const data = await readData();
  const { page = 1, limit = 10, q, sort, order = 'asc' } = req.query;

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
    throw new ValidationError('Invalid page parameter');
  }

  if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
    throw new ValidationError('Invalid limit parameter. Must be between 1 and 100');
  }

  // Apply sorting if specified
  if (sort) {
    const validSortFields = ['name', 'category', 'price'];
    if (!validSortFields.includes(sort)) {
      throw new ValidationError(`Invalid sort field. Must be one of: ${validSortFields.join(', ')}`);
    }

    const sortOrder = order.toLowerCase() === 'desc' ? -1 : 1;
    results.sort((a, b) => {
      if (typeof a[sort] === 'string') {
        return sortOrder * a[sort].localeCompare(b[sort]);
      }
      return sortOrder * (a[sort] - b[sort]);
    });
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
}));

// GET /api/items/:id - Get single item by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const data = await readData();
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    throw new ValidationError('Invalid ID parameter');
  }

  const item = data.find(i => i.id === id);
  if (!item) {
    throw new NotFoundError(`Item with ID ${id} not found`);
  }

  res.json(item);
}));

// POST /api/items - Create new item
router.post('/', asyncHandler(async (req, res) => {
  const item = req.body;

  // Validate item data
  validateItem(item);

  const data = await readData();

  // Check for duplicate names
  if (data.some(i => i.name.toLowerCase() === item.name.toLowerCase())) {
    throw new ValidationError('An item with this name already exists');
  }

  item.id = Date.now();
  data.push(item);

  await writeData(data);
  res.status(201).json(item);
}));

// PUT /api/items/:id - Update item
router.put('/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const updates = req.body;

  if (isNaN(id)) {
    throw new ValidationError('Invalid ID parameter');
  }

  const data = await readData();
  const itemIndex = data.findIndex(i => i.id === id);

  if (itemIndex === -1) {
    throw new NotFoundError(`Item with ID ${id} not found`);
  }

  // Validate updates
  validateItem({ ...data[itemIndex], ...updates });

  // Check for duplicate names (excluding current item)
  if (updates.name && data.some(i =>
    i.id !== id && i.name.toLowerCase() === updates.name.toLowerCase()
  )) {
    throw new ValidationError('An item with this name already exists');
  }

  data[itemIndex] = { ...data[itemIndex], ...updates };
  await writeData(data);

  res.json(data[itemIndex]);
}));

// DELETE /api/items/:id - Delete item
router.delete('/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    throw new ValidationError('Invalid ID parameter');
  }

  const data = await readData();
  const itemIndex = data.findIndex(i => i.id === id);

  if (itemIndex === -1) {
    throw new NotFoundError(`Item with ID ${id} not found`);
  }

  data.splice(itemIndex, 1);
  await writeData(data);

  res.status(204).send();
}));

module.exports = router;
