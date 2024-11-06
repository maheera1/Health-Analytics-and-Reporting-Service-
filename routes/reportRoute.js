import express from 'express';
import { 
    getAllReports,
    getReportById,
    createReport,
    deleteReport,
    updateReport
 } from '../controllers/reportController.js';

const router = express.Router();

router.get('/reports', getAllReports);
router.get('/reports/:id', getReportById);
router.post('/reports', createReport)
router.put('/reports/:id', updateReport);
router.delete('/reports/:id', deleteReport);

export default router;