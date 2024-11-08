import express from 'express';
const router = express.Router();

import  {
  getAllHospitalOperationsReports,
  getHospitalOperationsReportById,
  createHospitalOperationsReport,
  updateHospitalOperationsReport,
  deleteHospitalOperationsReport,
}  from '../controllers/hospitalOperationsController.js';

router.get('/hospitalOperations', getAllHospitalOperationsReports);
router.get('/hospitalOperations/:id', getHospitalOperationsReportById);
router.post('/hospitalOperations', createHospitalOperationsReport);
router.put('/hospitalOperations/:id', updateHospitalOperationsReport);
router.delete('/hospitalOperations/:id', deleteHospitalOperationsReport);

export default router;