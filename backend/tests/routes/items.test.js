const request = require('supertest');
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const itemsRouter = require('../../src/routes/items');
const { errorHandler } = require('../../src/middleware/errorHandler');

// Mock do módulo fs.promises
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn()
  }
}));

describe('Items Routes', () => {
  let app;
  const mockItems = [
    { id: 1, name: 'Test Item 1', category: 'Test', price: 100 },
    { id: 2, name: 'Test Item 2', category: 'Test', price: 200 }
  ];

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/items', itemsRouter);
    app.use(errorHandler); // Add error handler middleware

    // Reset mocks
    jest.clearAllMocks();
    require('fs').promises.readFile.mockResolvedValue(JSON.stringify(mockItems));
    require('fs').promises.writeFile.mockResolvedValue();
  });

  describe('GET /api/items', () => {
    it('should return all items', async () => {
      const response = await request(app).get('/api/items');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        data: mockItems,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 2,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPreviousPage: false
        }
      });
    });

    it('should filter items by search query', async () => {
      const response = await request(app).get('/api/items?q=Item 1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        data: [mockItems[0]],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPreviousPage: false
        }
      });
    });

    it('should limit number of items', async () => {
      const response = await request(app).get('/api/items?limit=1');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination).toEqual({
        currentPage: 1,
        totalPages: 2,
        totalItems: 2,
        itemsPerPage: 1,
        hasNextPage: true,
        hasPreviousPage: false
      });
    });

    it('should return 400 for invalid limit', async () => {
      const response = await request(app).get('/api/items?limit=-1');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Validation failed',
        details: ['Invalid limit parameter. Must be between 1 and 100']
      });
    });
  });

  describe('GET /api/items/:id', () => {
    it('should return item by id', async () => {
      const response = await request(app).get('/api/items/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockItems[0]);
    });

    it('should return 404 for non-existent id', async () => {
      const response = await request(app).get('/api/items/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'Item with ID 999 not found'
      });
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app).get('/api/items/invalid');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Validation failed',
        details: ['Invalid ID parameter']
      });
    });
  });

  describe('POST /api/items', () => {
    it('should create new item', async () => {
      const newItem = {
        name: 'New Item',
        category: 'Test',
        price: 300
      };

      const response = await request(app)
        .post('/api/items')
        .send(newItem);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newItem.name);
      expect(response.body.category).toBe(newItem.category);
      expect(response.body.price).toBe(newItem.price);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Validation failed',
        details: ['Name is required', 'Category is required', 'Price is required']
      });
    });

    it('should return 400 for invalid price', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({
          name: 'Test Item',
          category: 'Test',
          price: -100
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Validation failed',
        details: ['Price cannot be negative']
      });
    });

    it('should return 400 for empty name', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({
          name: '   ',
          category: 'Test',
          price: 100
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Validation failed',
        details: ['Name cannot be empty']
      });
    });
  });
});
