const express = require('express');
const router = express.Router();
const itemsRouter = require('./items');
const statsRouter = require('./stats');

router.use('/items', itemsRouter);
router.use('/stats', statsRouter);

module.exports = router;
