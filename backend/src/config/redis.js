const Redis = require('ioredis');
const path = require('path');

const DATA_PATH = process.env.DATA_PATH || path.join(__dirname, '../../../data/items.json');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

module.exports = { redis, DATA_PATH };
