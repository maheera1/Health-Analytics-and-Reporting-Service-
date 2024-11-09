// routes/patientHealthRoutes.js

import express from 'express';
import { getAllPatientHealthReports, createPatientHealthReport, getPatientHealthReportById, updatePatientHealthReport, deletePatientHealthReport } from '../controllers/patientHealthController.js';

const router = express.Router();

// Route to get all Patient Health reports
router.get('/patientHealth', getAllPatientHealthReports);

// Route to create a new Patient Health report
router.post('/patientHealth', createPatientHealthReport);

// Route to get a single Patient Health report by ID
router.get('/patientHealth/:id', getPatientHealthReportById);

// Route to update a Patient Health report by ID
router.put('/patientHealth/:id', updatePatientHealthReport);

// Route to delete a Patient Health report by ID
router.delete('/patientHealth/:id', deletePatientHealthReport);

export default router;
