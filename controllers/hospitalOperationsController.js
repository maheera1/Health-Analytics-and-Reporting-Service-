import { asyncHandler } from '../middleware/asyncHandler.js';
import { createError } from '../middleware/errorTypes.js';
import { HospitalOperationsReport } from "../models/HealthAnalyst.schema.js"
import { generatePDF } from '../utils/generatePDF.js';

import fs from 'fs';
import path from 'path';

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

  await generateHospitalOperationsReport(req.body)

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
    const outputPath = `Hospital_Operations_Report.pdf`;

    let html = fs.readFileSync(path.join("templates", 'hospital_operations.html'), 'utf8');
    html = reportReplaceHelper(data, html);
    
    await generatePDF(outputPath, html, "Hospital Operations Report");

  } catch (error) {
    console.error("Error generating hospital operations report PDF:", error);
  }
};

//adds data to .html template
const reportReplaceHelper = (data, html) => {
  html = html.replace('{{title}}', data.title || '');
  html = html.replace('{{description}}', data.description || '');
  html = html.replace('{{dateRange.startDate}}', data.dateRange?.startDate || '')
      .replace('{{dateRange.endDate}}', data.dateRange?.endDate || '');
  html = html.replace('{{department}}', data.department || '');
  html = html.replace('{{metrics.admissions}}', data.metrics?.admissions || '')
      .replace('{{metrics.discharges}}', data.metrics?.discharges || '')
      .replace('{{metrics.bedOccupancy}}', data.metrics?.bedOccupancy || '')
      .replace('{{metrics.averageLOS}}', data.metrics?.averageLOS || '')
      .replace('{{metrics.emergencyVisits}}', data.metrics?.emergencyVisits || '')
      .replace('{{metrics.surgeries}}', data.metrics?.surgeries || '');
  html = html.replace('{{staffing.doctorsOnDuty}}', data.staffing?.doctorsOnDuty || '')
      .replace('{{staffing.nursesOnDuty}}', data.staffing?.nursesOnDuty || '')
      .replace('{{staffing.supportStaff}}', data.staffing?.supportStaff || '');
  html = html.replace('{{metadata.createdBy}}', data.metadata?.createdBy || '')
      .replace('{{metadata.createdAt}}', data.metadata?.createdAt || '');
  html = html.replace('{{status}}', data.status || '');
  if (data.resources?.equipmentUtilization) {
    let equipmentHtml = '<table><tr><th>Equipment</th><th>Utilization (%)</th></tr>';
    for (const [equipment, utilization] of Object.entries(data.resources.equipmentUtilization)) {
    equipmentHtml += `<tr><td>${equipment}</td><td>${utilization}</td></tr>`
    }
    equipmentHtml += '</table>'
    html = html.replace('{{Equipment Utilization}}', equipmentHtml);
  }

  // Handle medicine inventory
  // if (data.resources?.medicineInventory) {
  // let inventoryHtml = '';
  // for (const [item, status] of Object.entries(data.resources.medicineInventory)) {
  // inventoryHtml += `${item}       ${status}\n`;
  // }
  // html = html.replace('{{#each resources.medicineInventory}}{{/each}}', inventoryHtml);
  // }

  // // Handle critical alerts
  // if (data.resources?.criticalAlerts?.length) {
  // const alertsHtml = data.resources.criticalAlerts.map(alert => `* ${alert}`).join('\n');
  // html = html.replace('{{#each resources.criticalAlerts}}       * {{this}}       {{/each}}', alertsHtml);
  // }

  // // Handle analysis sections
  // if (data.analysis?.trends) {
  // const trendsHtml = data.analysis.trends.map(trend => `* ${trend}`).join('\n');
  // html = html.replace('{{#each analysis.trends}}     * {{this}}     {{/each}}', trendsHtml);
  // }

  // if (data.analysis?.bottlenecks) {
  // const bottlenecksHtml = data.analysis.bottlenecks.map(bottleneck => `* ${bottleneck}`).join('\n');
  // html = html.replace('{{#each analysis.bottlenecks}}     * {{this}}     {{/each}}', bottlenecksHtml);
  // }

  // if (data.analysis?.recommendations) {
  // const recommendationsHtml = data.analysis.recommendations.map(rec => `* ${rec}`).join('\n');
  // html = html.replace('{{#each analysis.recommendations}}     * {{this}}     {{/each}}', recommendationsHtml);
  // }

  return html
}
