import express from 'express';
const router = express.Router();

import  {
    getAllTreatmentOutcomeReports,
    getSingleTreatmentOutcomeReport,
    createTreatmentOutcomeReport,
    updateTreatmentOutcomeReport,
    deleteTreatmentOutcomeReport
}  from '../controllers/treatmentOutcomeController.js';

router.get('/report', getAllTreatmentOutcomeReports);
router.get('/report/:id', getSingleTreatmentOutcomeReport);
router.post('/report', createTreatmentOutcomeReport);
router.put('/report/:id', updateTreatmentOutcomeReport);
router.delete('/report/:id', deleteTreatmentOutcomeReport);

export default router;