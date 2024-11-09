import { asyncHandler } from '../middleware/asyncHandler.js';
import { createError } from '../middleware/errorTypes.js';
import { TreatmentOutcomeReport } from "../models/HealthAnalyst.schema.js";

// Get all Treatment Outcome Reports
export const getAllTreatmentOutcomeReports = asyncHandler(async (req, res) => {
  const reports = await TreatmentOutcomeReport.find().populate('patientId', 'name dateOfBirth gender contactInfo');
  if (!reports.length) {
    throw createError(404, 'No treatment outcome reports found');
  }
  res.json({ success: true, data: reports });
});

// Get a single Treatment Outcome Report by ID
export const getSingleTreatmentOutcomeReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const report = await TreatmentOutcomeReport.findById(id).populate('patientId', 'name dateOfBirth gender contactInfo');
  if (!report) {
    throw createError(404, 'Treatment outcome report not found');
  }
  res.json({ success: true, data: report });
});

// Create a new Treatment Outcome Report
export const createTreatmentOutcomeReport = asyncHandler(async (req, res) => {
  const { reportType, title, description, dateRange, metadata, status, exportFormat, patientId,  diagnosis, treatment, outcomes, recommendations } = req.body;
  
  const report = await TreatmentOutcomeReport.create({
    reportType,
    title,
    description,
    dateRange,
    metadata,
    status,
    exportFormat,
    patientId,
    diagnosis,
    treatment,
    outcomes,
    recommendations,
  });
  
  res.status(201).json({ success: true, data: report });
});

// Update a Treatment Outcome Report by ID
export const updateTreatmentOutcomeReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const report = await TreatmentOutcomeReport.findByIdAndUpdate(id, updates, { new: true }).populate('patientId', 'name dateOfBirth gender contactInfo');
  if (!report) {
    throw createError(404, 'Treatment outcome report not found');
  }
  res.json({ success: true, data: report });
});

// Delete a Treatment Outcome Report by ID
export const deleteTreatmentOutcomeReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const report = await TreatmentOutcomeReport.findByIdAndDelete(id);
  if (!report) {
    throw createError(404, 'Treatment outcome report not found');
  }
  res.json({ success: true, message: 'Report deleted successfully' });
});
