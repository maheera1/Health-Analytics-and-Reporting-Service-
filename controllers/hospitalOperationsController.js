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

//temmplate comtain conditions, loops etc. this helper function removes such and add actual report data using regex
const reportReplaceHelper = (data, html) => {
  // Replace basic fields first
  html = html
    .replace(/{{title}}/g, data.title || '')
    .replace(/{{description}}/g, data.description || '')
    .replace(/{{department}}/g, data.department || '');

  // Replace date range
  if (data.dateRange) {
    html = html
      .replace(/{{dateRange\.startDate}}/g, data.dateRange.startDate || '')
      .replace(/{{dateRange\.endDate}}/g, data.dateRange.endDate || '');
  }

  // Handle medicine inventory section
  if (data.resources?.medicineInventory) {
    const inventorySection = `
      <div class="metric-card">
        <h2>Medicine Inventory Status</h2>
        <table>
          <tr>
            <th>Item</th>
            <th>Status</th>
          </tr>
          ${Object.entries(data.resources.medicineInventory)
            .map(([item, status]) => `
              <tr>
                <td>${item}</td>
                <td>${status}</td>
              </tr>`)
            .join('')}
        </table>
      </div>`;
    
    // Replace the entire conditional section
    html = html.replace(
      /\{\{#if resources\.medicineInventory\}\}[\s\S]*?\{\{\/if\}\}/g,
      inventorySection
    );
  } else {
    // Remove the conditional section if no inventory data
    html = html.replace(
      /\{\{#if resources\.medicineInventory\}\}[\s\S]*?\{\{\/if\}\}/g,
      ''
    );
  }

  if (data.resources?.equipmentUtilization) {
    const equipmentSection = `
      <div class="metric-card">
        <h2>Machine Inventory</h2>
        <table>
          <tr>
            <th>Item</th>
            <th>Status</th>
          </tr>
          ${Object.entries(data.resources.equipmentUtilization)
            .map(([item, status]) => `
              <tr>
                <td>${item}</td>
                <td>${status}</td>
              </tr>`)
            .join('')}
        </table>
      </div>`;
    html = html.replace(
      /\{\{#if Equipment Utilization\}\}[\s\S]*?\{\{Equipment Utilization\}\}[\s\S]*?\{\{\/if\}\}/g,
      equipmentSection
    );
  } else {
    html = html.replace(
      /\{\{#if Equipment Utilization\}\}[\s\S]*?\{\{\/if\}\}/g,
      ''
    );
  }

  // Handle critical alerts
  if (data.resources?.criticalAlerts?.length) {
    const alertsSection = `
      <div class="alert">
        <h3>Critical Alerts</h3>
        <ul>
          ${data.resources.criticalAlerts
            .map(alert => `<li>${alert}</li>`)
            .join('')}
        </ul>
      </div>`;
    
    html = html.replace(
      /\{\{#if resources\.criticalAlerts\.length\}\}[\s\S]*?\{\{\/if\}\}/g,
      alertsSection
    );
  } else {
    html = html.replace(
      /\{\{#if resources\.criticalAlerts\.length\}\}[\s\S]*?\{\{\/if\}\}/g,
      ''
    );
  }

  // Handle analysis sections (trends, bottlenecks, recommendations)
  const analysisTypes = ['trends', 'bottlenecks', 'recommendations'];
  analysisTypes.forEach(type => {
    if (data.analysis?.[type]?.length) {
      const sectionHtml = `
        <h3>${type.charAt(0).toUpperCase() + type.slice(1)}</h3>
        <ul>
          ${data.analysis[type]
            .map(item => `<li>${item}</li>`)
            .join('')}
        </ul>`;
      
      // Replace each section's conditional block
      const sectionRegex = new RegExp(
        `\\{\\{#if analysis\\.${type}\\}\\}[\\s\\S]*?\\{\\{#each analysis\\.${type}\\}\\}[\\s\\S]*?\\{\\{\/each\\}\\}[\\s\\S]*?\\{\\{\/if\\}\\}`,
        'g'
      );
      html = html.replace(sectionRegex, sectionHtml);
    } else {
      // Remove the section if no data
      const sectionRegex = new RegExp(
        `\\{\\{#if analysis\\.${type}\\}\\}[\\s\\S]*?\\{\\{\/if\\}\\}`,
        'g'
      );
      html = html.replace(sectionRegex, '');
    }
  });

  // hanlde metrics table
  const metricsConfig = [
    { key: 'admissions', label: 'Admissions' },
    { key: 'discharges', label: 'Discharges' },
    { key: 'bedOccupancy', label: 'Bed Occupancy', suffix: '%' },
    { key: 'averageLOS', label: 'Average LOS', suffix: ' days' },
    { key: 'emergencyVisits', label: 'Emergency Visits' },
    { key: 'surgeries', label: 'Surgeries' }
  ];

  metricsConfig.forEach(({ key, label, suffix = '' }) => {
    if (data.metrics?.[key] !== undefined) {
      const metricRow = `
        <tr>
          <td>${label}</td>
          <td>${data.metrics[key]}${suffix}</td>
        </tr>`;
      
      const metricRegex = new RegExp(
        `\\{\\{#if metrics\\.${key}\\}\\}[\\s\\S]*?\\{\\{\/if\\}\\}`,
        'g'
      );
      html = html.replace(metricRegex, metricRow);
    } else {
      const metricRegex = new RegExp(
        `\\{\\{#if metrics\\.${key}\\}\\}[\\s\\S]*?\\{\\{\/if\\}\\}`,
        'g'
      );
      html = html.replace(metricRegex, '');
    }
  });

  // handle staffing table
  const staffingConfig = [
    { key: 'doctorsOnDuty', label: 'Doctors on Duty' },
    { key: 'nursesOnDuty', label: 'Nurses on Duty' },
    { key: 'supportStaff', label: 'Support Staff' }
  ];

  staffingConfig.forEach(({ key, label }) => {
    if (data.staffing?.[key] !== undefined) {
      const staffRow = `
        <tr>
          <td>${label}</td>
          <td>${data.staffing[key]}</td>
        </tr>`;
      
      const staffRegex = new RegExp(
        `\\{\\{#if staffing\\.${key}\\}\\}[\\s\\S]*?\\{\\{\/if\\}\\}`,
        'g'
      );
      html = html.replace(staffRegex, staffRow);
    } else {
      const staffRegex = new RegExp(
        `\\{\\{#if staffing\\.${key}\\}\\}[\\s\\S]*?\\{\\{\/if\\}\\}`,
        'g'
      );
      html = html.replace(staffRegex, '');
    }
  });

  // Replace metadata
  if (data.metadata) {
    html = html
      .replace(/{{metadata\.createdBy}}/g, data.metadata.createdBy || '')
      .replace(/{{metadata\.createdAt}}/g, data.metadata.createdAt || '');
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

