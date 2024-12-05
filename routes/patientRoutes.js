import express from "express";
import {
  getAllPatients,
  createPatient,
} from "../controllers/patientController.js";

const router = express.Router();

// Route to fetch all patients
router.get("/patients", getAllPatients);

// Route to create a new patient
router.post("/patients", createPatient);

export default router;
