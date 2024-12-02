// routes/temporalAnalyticsRoutes.js
import express from 'express';
import { getTemporalAnalytics, getDailyPatterns } from '../controllers/temporalAnalyticsController.js';

const router = express.Router();

router.get('/temporal', getTemporalAnalytics);
router.get('/daily-patterns', getDailyPatterns);

export default router;