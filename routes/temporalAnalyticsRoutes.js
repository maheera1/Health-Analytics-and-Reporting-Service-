// routes/temporalAnalyticsRoutes.js
import express from 'express';
import { getTemporalAnalytics, getDailyPatterns, getAggregatedMetrics } from '../controllers/temporalAnalyticsController.js';

const router = express.Router();

router.get('/temporal', getTemporalAnalytics);
router.get('/temporal/aggregated', getAggregatedMetrics);
router.get('/daily-patterns', getDailyPatterns);

export default router;