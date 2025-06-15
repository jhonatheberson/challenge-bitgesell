const request = require('supertest');
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const itemsRouter = require('../../src/routes/items');

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

    // Reset mocks
    jest.clearAllMocks();
    require('fs').promises.readFile.mockResolvedValue(JSON.stringify(mockItems));
    require('fs').promises.writeFile.mockResolvedValue();
  });

  describe('GET /api/items', () => {
    it('should return all items', async () => {
      const response = await request(app).get('/api/items');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockItems);
    });

    it('should filter items by search query', async () => {
      const response = await request(app).get('/api/items?q=Item 1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([mockItems[0]]);
    });

    it('should limit number of items', async () => {
      const response = await request(app).get('/api/items?limit=1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
    });

    it('should return 400 for invalid limit', async () => {
      const response = await request(app).get('/api/items?limit=-1');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid limit parameter');
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
      expect(response.body).toHaveProperty('error', 'Item not found');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app).get('/api/items/invalid');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid ID parameter');
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
      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details).toContain('Name is required');
      expect(response.body.details).toContain('Category is required');
      expect(response.body.details).toContain('Price is required');
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
      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details).toContain('Price cannot be negative');
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
      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details).toContain('Name cannot be empty');
    });
  });
});
