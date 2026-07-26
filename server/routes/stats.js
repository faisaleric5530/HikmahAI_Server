const { Router } = require('express');
const StatsController = require('../controllers/stats-controller');

const statsRouter = Router();

// Public — powers the landing page stats strip, no auth required.
statsRouter.get('/', StatsController.getStats);

module.exports = statsRouter;
