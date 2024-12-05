import Patient from "../models/Patient.schema.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

// Fetch all patients
export const getAllPatients = asyncHandler(async (req, res) => {
  const patients = await Patient.find(); // Fetch all patients from the database
  res.status(200).json(patients); // Return the patients as JSON
});

// Create a new patient
export const createPatient = asyncHandler(async (req, res) => {
  const {
    name,
    dateOfBirth,
    gender,
    contactInfo,
    bloodType,
    primaryCareDoctor,
    diagnosis,
  } = req.body;

  if (
    !name ||
    !dateOfBirth ||
    !gender ||
    !contactInfo?.phone ||
    !contactInfo?.email ||
    !contactInfo?.address ||
    !diagnosis
  ) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  const newPatient = await Patient.create({
    name,
    dateOfBirth,
    gender,
    contactInfo,
    bloodType,
    primaryCareDoctor,
    diagnosis,
  });

  res.status(201).json(newPatient); // Return the newly created patient
});
