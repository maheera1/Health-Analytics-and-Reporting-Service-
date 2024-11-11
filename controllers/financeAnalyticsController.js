import { asyncHandler } from '../middleware/asyncHandler.js';
import { createError } from '../middleware/errorTypes.js';
import { FinancialAnalyticsReport } from '../models/HealthAnalyst.schema.js';
import { generatePDF } from '../utils/generatePDF.js';
import fs from 'fs';
import path from 'path';
import { generateFinancialReport } from '../utils/reportGenerator.js';


// GET all financial analytics reports
export const getAllFinancialAnalyticsReports = asyncHandler(async (req, res) => {
  const reports = await FinancialAnalyticsReport.find();
  if (reports.length === 0) {
    throw createError(404, 'No financial analytics reports found');
  }
  res.json({ success: true, data: reports });
});

// GET a financial analytics report by ID
export const getFinancialAnalyticsReportById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const report = await FinancialAnalyticsReport.findById(id);
  if (!report) {
    throw createError(404, `Report with ID ${id} not found`);
  }
  res.json({ success: true, data: report });
});

// CREATE a new financial analytics report
export const createFinancialAnalyticsReport = asyncHandler(async (req, res) => {
  const { reportType, title, description, dateRange, metadata, status, exportFormat, department, revenueData, expenses, analysis } = req.body;

  if (!reportType || !title || !dateRange || !dateRange.startDate || !dateRange.endDate || !metadata || !metadata.createdBy || !exportFormat || !revenueData || !expenses || !analysis) {
    throw createError(400, 'Please provide all required fields');
  }

  const newReport = await FinancialAnalyticsReport.create({
    reportType,
    title,
    description,
    dateRange,
    metadata,
    status,
    exportFormat,
    department,
    revenueData,
    expenses,
    analysis,
  });

  await generateFinancialAnalyticsReport(req.body);

  res.status(201).json({ success: true, data: newReport });
});

// UPDATE an existing financial analytics report
export const updateFinancialAnalyticsReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { description, department, revenueData, expenses, analysis } = req.body;

  const report = await FinancialAnalyticsReport.findById(id);
  if (!report) {
    throw createError(404, `Report with ID ${id} not found`);
  }

  report.description = description || report.description;
  report.department = department || report.department;
  report.revenueData = revenueData || report.revenueData;
  report.expenses = expenses || report.expenses;
  report.analysis = analysis || report.analysis;

  await report.save();

  res.json({ success: true, data: report });
});

// DELETE a financial analytics report by ID
export const deleteFinancialAnalyticsReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const report = await FinancialAnalyticsReport.findByIdAndDelete(id);
  if (!report) {
    throw createError(404, `Report with ID ${id} not found`);
  }
  res.json({ success: true, message: 'Report deleted' });
});

// Generate PDF for Financial Analytics Report
export const generateFinancialAnalyticsReport = async (data) => {
    try {
        const outputPath = path.join('public', 'reports', 'financial_report.pdf');
    
        let html = fs.readFileSync(path.join("templates", 'financial_report.html'), 'utf8');
        html = reportReplaceHelper(data, html);
        
        await generatePDF(outputPath, html, "Financial Analysis Report");
    
        return outputPath; // Return path for easy access later
      } catch (error) {
        console.error("Error generating financial report PDF:", error);
        throw error;
      }
};

// Helper function to replace template placeholders with actual report data
const financialReportReplaceHelper = (data, html) => {
  html = html
    .replace(/{{title}}/g, data.title || '')
    .replace(/{{description}}/g, data.description || '')
    .replace(/{{department}}/g, data.department || '');

  if (data.dateRange) {
    html = html
      .replace(/{{dateRange\.startDate}}/g, data.dateRange.startDate || '')
      .replace(/{{dateRange\.endDate}}/g, data.dateRange.endDate || '');
  }

  if (data.revenueData) {
    const revenueSection = 
      `<div class="metric-card">
        <h2>Revenue Data</h2>
        <table>
          <tr><th>Source</th><th>Amount</th></tr>
          ${Object.entries(data.revenueData)
            .map(([source, amount]) => `<tr><td>${source}</td><td>${amount}</td></tr>`)
            .join('')}
        </table>
      </div>`;
    
    html = html.replace(/\{\{#if revenueData\}\}[\s\S]*?\{\{\/if\}\}/g, revenueSection);
  } else {
    html = html.replace(/\{\{#if revenueData\}\}[\s\S]*?\{\{\/if\}\}/g, '');
  }

  if (data.expenses) {
    const expensesSection = 
      `<div class="metric-card">
        <h2>Expenses</h2>
        <table>
          <tr><th>Category</th><th>Amount</th></tr>
          ${Object.entries(data.expenses)
            .map(([category, amount]) => `<tr><td>${category}</td><td>${amount}</td></tr>`)
            .join('')}
        </table>
      </div>`;
    
    html = html.replace(/\{\{#if expenses\}\}[\s\S]*?\{\{\/if\}\}/g, expensesSection);
  } else {
    html = html.replace(/\{\{#if expenses\}\}[\s\S]*?\{\{\/if\}\}/g, '');
  }

  const analysisTypes = ['trends', 'projections', 'recommendations'];
  analysisTypes.forEach(type => {
    if (data.analysis?.[type]?.length) {
      const sectionHtml = 
        `<h3>${type.charAt(0).toUpperCase() + type.slice(1)}</h3>
        <ul>
          ${data.analysis[type].map(item => `<li>${item}</li>`).join('')}
        </ul>`;
      
      const sectionRegex = new RegExp(
        `\\{\\{#if analysis\\.${type}\\}\\}[\\s\\S]*?\\{\\{\/if\\}\\}`,
        'g'
      );
      html = html.replace(sectionRegex, sectionHtml);
    } else {
      const sectionRegex = new RegExp(
        `\\{\\{#if analysis\\.${type}\\}\\}[\\s\\S]*?\\{\\{\/if\\}\\}`,
        'g'
      );
      html = html.replace(sectionRegex, '');
    }
  });

  if (data.metadata) {
    html = html
      .replace(/{{metadata\.createdBy}}/g, data.metadata.createdBy || '')
      .replace(/{{metadata\.createdAt}}/g, data.metadata.createdAt || '');
  }

  return html;
};
