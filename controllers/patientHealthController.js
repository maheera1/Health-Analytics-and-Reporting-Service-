// controllers/patientHealthController.js

import { asyncHandler } from '../middleware/asyncHandler.js';
import { createError } from '../middleware/errorTypes.js';
import { PatientHealthReport } from "../models/HealthAnalyst.schema.js";
import { generatePDF } from '../utils/generatePDF.js';
import Patient from '../models/Patient.schema.js';
import { generatePatientHealthPDF } from '../utils/generatePDF.js';



// Get all Patient Health reports
export const getAllPatientHealthReports = async (req, res, next) => {
  try {
    const reports = await Patient.find();
    if (reports.length === 0) {
      // Return an empty array and a 200 status if no reports are found
      return res.status(200).json([]);
    }
    res.json(reports);
  } catch (error) {
    next(error);
  }
};


// Create a new Patient Health report
export const createPatientHealthReport = asyncHandler(async (req, res) => {
  const {
    patientId,
    patientName,
    patientAge,
    patientGender,
    bloodType,
    primaryCareDoctor,
    contactInfo,
    vitals,
    labResults,
    summary,
    title,
    dateRange,
    metadata,
    exportFormat
  } = req.body;

  // Log the incoming request data
  console.log("Received data to create report:", req.body);

  // Validate required fields
  if (!patientId || !patientName || !patientAge || !patientGender || !vitals || !summary || !title || !dateRange || !metadata || !exportFormat) {
    throw createError(400, 'Please provide all required fields');
  }

  // Prepare data for PDF generation, using patient details from the request
  const pdfData = {
    patient: {
      id: patientId,
      name: patientName,
      age: patientAge,
      gender: patientGender,
      bloodType: bloodType || "N/A",
      primaryCareDoctor: primaryCareDoctor || "Not Available",
      contactInfo: {
        phone: contactInfo?.phone || "Not Available",
        email: contactInfo?.email || "Not Available",
        address: contactInfo?.address || "Not Available"
      }
    },
    diagnosis: summary,
    medications: req.body.medications || [], // Use medications if provided
    labResults,
    criticalAlerts: req.body.criticalAlerts || [], // Use alerts if provided
    metadata,
  };

  // Generate PDF report with all data
  await generatePatientHealthPDF(pdfData);

  // Create the health report record in the database
  const newReport = await PatientHealthReport.create({
    patientId,
    vitals,
    labResults,
    summary,
    title,
    dateRange,
    metadata,
    exportFormat
  });

  res.status(201).json({ success: true, data: newReport });
});

// Get a single Patient Health report by ID
export const getPatientHealthReportById = asyncHandler(async (req, res, next) => {
  const report = await PatientHealthReport.findById(req.params.id);
  if (!report) {
    console.warn(`Patient Health report with ID ${req.params.id} not found`);
    throw createError(404, `Patient Health report with ID ${req.params.id} not found`);
  }
  res.json(report);
});


// Update an existing Patient Health report
export const updatePatientHealthReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { vitals, labResults, summary, title, dateRange, metadata, exportFormat } = req.body;

  // Find the report by ID and update fields if provided
  const report = await PatientHealthReport.findById(id);
  if (!report) {
    throw createError(404, `Patient Health report with ID ${id} not found`);
  }

  report.vitals = vitals || report.vitals;
  report.labResults = labResults || report.labResults;
  report.summary = summary || report.summary;
  report.title = title || report.title;
  report.dateRange = dateRange || report.dateRange;
  report.metadata = metadata || report.metadata;
  report.exportFormat = exportFormat || report.exportFormat;

  await report.save();

  res.json({ success: true, data: report });
});

// Delete a Patient Health report by ID
export const deletePatientHealthReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const report = await PatientHealthReport.findByIdAndDelete(id);
  if (!report) {
    throw createError(404, `Patient Health report with ID ${id} not found`);
  }
  res.json({ success: true, message: 'Patient Health report deleted' });
});
