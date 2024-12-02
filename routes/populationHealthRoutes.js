// routes/populationHealthRoutes.js
import express from 'express';
import { 
    getAgeDistribution, 
    getVitalsDistribution,
    getDiseaseDistribution,
    getDemographicPatterns 
} from '../controllers/populationHealthController.js';

const router = express.Router();

// Demographics routes
router.get('/population/age-distribution', getAgeDistribution);
router.get('/population/vitals-stats', getVitalsDistribution);
router.get('/population/disease-distribution', getDiseaseDistribution);
router.get('/population/demographic-patterns', getDemographicPatterns);

export default router;