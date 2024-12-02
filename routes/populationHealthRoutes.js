// routes/populationHealthRoutes.js
import express from 'express';
import { 
    getAgeDistribution, 
    getVitalsDistribution 
} from '../controllers/populationHealthController.js';

const router = express.Router();

// Demographics routes
router.get('/population/age-distribution', getAgeDistribution);
router.get('/population/vitals-stats', getVitalsDistribution);

export default router;