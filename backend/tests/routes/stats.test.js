const request = require('supertest');
const express = require('express');
const statsRouter = require('../../src/routes/stats');

// Mocks
jest.mock('fs', () => ({
  promises: {
    stat: jest.fn()
  }
}));
jest.mock('../../src/utils/fileUtils', () => ({
  readData: jest.fn()
}));
jest.mock('../../src/middleware/cache', () => () => (req, res, next) => next());
jest.mock('../../src/config/redis', () => ({
  get: jest.fn(),
  setex: jest.fn()
}));

const { readData } = require('../../src/utils/fileUtils');
const { promises: fsPromises } = require('fs');

describe('Stats Routes', () => {
  let app;
  const mockItems = [
    { id: 1, name: 'Item 1', category: 'Cat1', price: 100 },
    { id: 2, name: 'Item 2', category: 'Cat2', price: 200 },
    { id: 3, name: 'Item 3', category: 'Cat1', price: 300 }
  ];
  const mockStat = {
    mtime: new Date('2024-01-01T12:00:00Z')
  };

  beforeEach(() => {
    app = express();
    app.use('/api/stats', statsRouter);
    jest.clearAllMocks();
  });

  it('should return stats for items (happy path)', async () => {
    readData.mockResolvedValue(mockItems);
    fsPromises.stat.mockResolvedValue(mockStat);

    const response = await request(app).get('/api/stats');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      totalItems: 3,
      categories: { Cat1: 2, Cat2: 1 },
      priceRange: {
        min: 100,
        max: 300,
        average: 200
      },
      metadata: {
        lastModified: mockStat.mtime.toISOString()
      }
    });
    expect(typeof response.body.metadata.calculatedAt).toBe('string');
  });

  it('should handle empty items array', async () => {
    readData.mockResolvedValue([]);
    fsPromises.stat.mockResolvedValue(mockStat);

    const response = await request(app).get('/api/stats');
    expect(response.status).toBe(200);
    expect(response.body.totalItems).toBe(0);
    expect(response.body.categories).toEqual({});
    expect(response.body.priceRange).toEqual({ min: null, max: null, average: 0 });
  });

  it('should handle error in readData', async () => {
    readData.mockRejectedValue(new Error('read error'));
    fsPromises.stat.mockResolvedValue(mockStat);

    const response = await request(app).get('/api/stats');
    expect(response.status).toBe(500);
  });

  it('should handle error in fs.stat', async () => {
    readData.mockResolvedValue(mockItems);
    fsPromises.stat.mockRejectedValue(new Error('stat error'));

    const response = await request(app).get('/api/stats');
    expect(response.status).toBe(500);
  });
});
