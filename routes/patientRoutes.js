import express from 'express';
import { createPatient } from '../controllers/patientController.js';

const router = express.Router();

// router.get('/users', getAllUsers);
router.post('/patients', createPatient);
// router.get('/users/:id', getUserById);

export default router;