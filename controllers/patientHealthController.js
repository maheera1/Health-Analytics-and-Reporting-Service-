// controllers/patientHealthController.js

import { asyncHandler } from '../middleware/asyncHandler.js';
import { createError } from '../middleware/errorTypes.js';
import { PatientHealthReport } from "../models/HealthAnalyst.schema.js";
import { generatePDF } from '../utils/generatePDF.js';

// Get all Patient Health reports
export const getAllPatientHealthReports = asyncHandler(async (req, res) => {
  const reports = await PatientHealthReport.find();
  if (reports.length === 0) {
    throw createError(404, 'No Patient Health reports found');
  }
  res.json({ success: true, data: reports });
});

// Create a new Patient Health report
export const createPatientHealthReport = asyncHandler(async (req, res) => {
  const { patientId, vitals, labResults, summary, title, dateRange, metadata, exportFormat } = req.body;

  // Validate required fields
  if (!patientId || !vitals || !summary || !title || !dateRange || !metadata || !exportFormat) {
    throw createError(400, 'Please provide all required fields');
  }

  // Create a new report in the database
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
export const getPatientHealthReportById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const report = await PatientHealthReport.findById(id);
  if (!report) {
    throw createError(404, `Patient Health report with ID ${id} not found`);
  }
  res.json({ success: true, data: report });
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
