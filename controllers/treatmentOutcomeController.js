import { asyncHandler } from '../middleware/asyncHandler.js';
import { createError } from '../middleware/errorTypes.js';
import { TreatmentOutcomeReport } from "../models/HealthAnalyst.schema.js";
import { generatePDF } from '../utils/generatePDF.js';

import fs from 'fs';
import path from 'path';

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

  await generateTreatmentOutcomeReport(req.body)
  
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




export const generateTreatmentOutcomeReport = async (data) => {
  try {
    const outputPath = `Treatment_Outcome_Report.pdf`;

    let html = fs.readFileSync(path.join("templates", 'treatment_outcome.html'), 'utf8');
    html = treatmentReportReplaceHelper(data, html);
    
    await generatePDF(outputPath, html, "Treatment Outcome Report");

  } catch (error) {
    console.error("Error generating treatment outcome report PDF:", error);
  }
};

const treatmentReportReplaceHelper = (data, html) => {
  // Replace basic fields
  html = html
    .replace(/{{title}}/g, data.title || '')
    .replace(/{{description}}/g, data.description || '')
    .replace(/{{status}}/g, data.status || '');

  // Replace date range
  if (data.dateRange) {
    html = html
      .replace(/{{dateRange\.startDate}}/g, formatDate(data.dateRange.startDate) || '')
      .replace(/{{dateRange\.endDate}}/g, formatDate(data.dateRange.endDate) || '');
  }

  // Replace treatment overview information
  if (data.diagnosis) {
    html = html.replace(/{{diagnosis}}/g, data.diagnosis);
  }

  if (data.treatment) {
    html = html
      .replace(/{{treatment\.type}}/g, data.treatment.type || '')
      .replace(/{{treatment\.name}}/g, data.treatment.name || '')
      .replace(/{{treatment\.startDate}}/g, formatDate(data.treatment.startDate) || '')
      .replace(/{{treatment\.endDate}}/g, formatDate(data.treatment.endDate) || '');
  }

  // Handle health metrics comparison table
  if (data.outcomes?.preMetrics) {
    const metricsRows = Object.entries(data.outcomes.preMetrics)
      .map(([key, preValue]) => {
        const postValue = data.outcomes.postMetrics?.[key] || '';
        const formattedKey = key.replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase());
        
        return `
          <tr>
            <td>${formattedKey}</td>
            <td>${preValue}</td>
            <td>${postValue}</td>
          </tr>`;
      })
      .join('');

    html = html.replace(
      /\{\{#each outcomes\.preMetrics\}\}[\s\S]*?\{\{\/each\}\}/g,
      metricsRows
    );
  }

  // Handle improvements list
  if (data.outcomes?.improvements?.length) {
    const improvementsHtml = data.outcomes.improvements
      .map(improvement => `<li>${improvement}</li>`)
      .join('');
    
    html = html.replace(
      /\{\{#if outcomes\.improvements\.length\}\}[\s\S]*?\{\{#each outcomes\.improvements\}\}[\s\S]*?\{\{\/each\}\}[\s\S]*?\{\{\/if\}\}/g,
      `<h3 style="color: var(--success-color); font-size: 0.9rem; margin-top: 1rem;">Improvements</h3>
      <ul class="outcome-list improvements">${improvementsHtml}</ul>`
    );
  } else {
    html = html.replace(
      /\{\{#if outcomes\.improvements\.length\}\}[\s\S]*?\{\{\/if\}\}/g,
      ''
    );
  }

  // Handle complications list
  if (data.outcomes?.complications?.length) {
    const complicationsHtml = data.outcomes.complications
      .map(complication => `<li>${complication}</li>`)
      .join('');
    
    html = html.replace(
      /\{\{#if outcomes\.complications\.length\}\}[\s\S]*?\{\{#each outcomes\.complications\}\}[\s\S]*?\{\{\/each\}\}[\s\S]*?\{\{\/if\}\}/g,
      `<h3 style="color: var(--warning-color); font-size: 0.9rem; margin-top: 1rem;">Complications</h3>
      <ul class="outcome-list complications">${complicationsHtml}</ul>`
    );
  } else {
    html = html.replace(
      /\{\{#if outcomes\.complications\.length\}\}[\s\S]*?\{\{\/if\}\}/g,
      ''
    );
  }

  // Handle recommendations section
  if (data.recommendations) {
    html = html.replace(
      /\{\{#if recommendations\}\}[\s\S]*?\{\{recommendations\}\}[\s\S]*?\{\{\/if\}\}/g,
      `<div class="recommendations-section">
        <h2>Recommendations</h2>
        <p>${data.recommendations}</p>
      </div>`
    );
  } else {
    html = html.replace(
      /\{\{#if recommendations\}\}[\s\S]*?\{\{\/if\}\}/g,
      ''
    );
  }

  // Replace metadata
  if (data.metadata) {
    html = html
      .replace(/{{metadata\.createdBy}}/g, data.metadata.createdBy || '')
      .replace(/{{metadata\.createdAt}}/g, formatDate(data.metadata.createdAt) || '');
  }

  // Clean up any remaining Handlebars syntax
  html = html
    .replace(/\{\{#each[\s\S]*?\}\}/g, '')
    .replace(/\{\{[@\/]each\}\}/g, '')
    .replace(/\{\{#if[\s\S]*?\}\}/g, '')
    .replace(/\{\{\/if\}\}/g, '')
    .replace(/\{\{[^}]+\}\}/g, '');

  return html;
};

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};