const redis = require('../config/redis');
const fs = require('fs').promises;
const path = require('path');

const DATA_PATH = path.join(__dirname, '../../../data/items.json');
const CACHE_TTL = 3600; // 1 hour in seconds

const cacheMiddleware = (key) => {
  return async (req, res, next) => {
    try {
      // Get file stats
      const fileStats = await fs.stat(DATA_PATH);
      const lastModified = fileStats.mtime.getTime();

      // Get cache metadata
      const cacheMetadata = await redis.get(`${key}:metadata`);
      const metadata = cacheMetadata ? JSON.parse(cacheMetadata) : null;

      // Check if cache is valid (exists and file hasn't changed)
      if (metadata && metadata.lastModified === lastModified) {
        const cachedData = await redis.get(key);
        if (cachedData) {
          return res.json(JSON.parse(cachedData));
        }
      }

      // Store original res.json
      const originalJson = res.json;

      // Override res.json method
      res.json = async function (data) {
        // Store data in cache
        await redis.setex(key, CACHE_TTL, JSON.stringify(data));

        // Store metadata
        await redis.setex(
          `${key}:metadata`,
          CACHE_TTL,
          JSON.stringify({ lastModified })
        );

        // Call original res.json
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

module.exports = cacheMiddleware;
