/**
 * Main entry point for the backend server
 * Sets up Express application with middleware and routes
 */
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const itemsRouter = require('./routes/items');
const statsRouter = require('./routes/stats');
const cors = require('cors');
const { getCookie, notFound } = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 3001;

// Configure CORS for development
app.use(cors({ origin: 'http://localhost:3000' }));

// Middleware
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api/items', itemsRouter);
app.use('/api/stats', statsRouter);

// Error handling
app.use('*', notFound);

// Initialize cookie handling
getCookie();

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
