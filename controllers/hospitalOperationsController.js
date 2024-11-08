import { asyncHandler } from '../middleware/asyncHandler.js';
import { createError } from '../middleware/errorTypes.js';
import { HospitalOperationsReport } from "../models/HealthAnalyst.schema.js"
import { generatePDF } from '../utils/generatePDF.js';

import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

// get all reports
export const getAllHospitalOperationsReports = asyncHandler(async (req, res) => {
  console.log("working!!!")
  const reports = await HospitalOperationsReport.find();
  if (reports.length === 0) {
    throw createError(404, 'No hospital operations reports found');
  }
  res.json({ success: true, data: reports });
});

// get by id
export const getHospitalOperationsReportById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const report = await HospitalOperationsReport.findById(id);
  if (!report) {
    throw createError(404, `Report with ID ${id} not found`);
  }
  res.json({ success: true, data: report });
});


// create new
export const createHospitalOperationsReport = asyncHandler(async (req, res) => {
  const {
    reportType,
    title,
    description,
    dateRange,
    metadata,
    status,
    exportFormat,
    department,
    metrics,
    staffing,
    resources,
    analysis
  } = req.body;
  console.log("working!!!")
  // Validate required fields
  if (
    !reportType ||
    !title ||
    !dateRange ||
    !dateRange.startDate ||
    !dateRange.endDate ||
    !metadata ||
    !metadata.createdBy ||
    !exportFormat ||
    !metrics ||
    !staffing ||
    !resources ||
    !analysis
  ) {
    throw createError(400, 'Please provide all required fields');
  }
  generateHospitalOperationsReport(res.body)
  // Create a new report using both base schema and specific schema fields
  const newReport = await HospitalOperationsReport.create({
    reportType,
    title,
    description,
    dateRange,
    metadata,
    status,
    exportFormat,
    department,
    metrics,
    staffing,
    resources,
    analysis,
  });

  res.status(201).json({ success: true, data: newReport });
});


// update existing
export const updateHospitalOperationsReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    description,
    department,
    metrics,
    staffing,
    resources,
    analysis
   } = req.body;

  // does report with given id exist?
  const report = await HospitalOperationsReport.findById(id);
  if (!report) {
    throw createError(404, `Report with ID ${id} not found`);
  }

  // update fields
  report.description = description || report.description;
  report.department = department || report.department;
  report.metrics = metrics || report.metrics;
  report.staffing = staffing || report.staffing;
  report.resources = resources || report.resources;
  report.analysis = analysis || report.analysis;

  await report.save();

  res.json({ success: true, data: report });
});

// delete by id
export const deleteHospitalOperationsReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const report = await HospitalOperationsReport.findByIdAndDelete(id);
  if (!report) {
    throw createError(404, `Report with ID ${id} not found`);
  }
  res.json({ success: true, message: 'Report deleted' });
});


export const generateHospitalOperationsReport = async (data) => {
  try {
    // Use an absolute path
    const templatePath = path.resolve('templates', 'hospital_operations.html');
    const outputPath = `Hospital_Operations_Report.pdf`;

    // Load and compile the HTML template
    const templateSource = await fs.promises.readFile(templatePath, 'utf8');
    const template = Handlebars.compile(templateSource);

    // Generate HTML by replacing placeholders with data
    const htmlContent = template(data);

    // Generate the PDF
    await generatePDF(outputPath, htmlContent, "Hospital Operations Report");

    console.log('PDF generation completed');
  } catch (error) {
    console.error("Error generating hospital operations report PDF:", error);
  }
};