import express from 'express';
import { FinancialAnalyticsReport } from '../models/HealthAnalyst.schema.js';
import { createError } from '../middleware/errorTypes.js';

const router = express.Router();

// CREATE - Create a new financial analytics report
router.post('/', async (req, res, next) => {
  try {
    const reportData = {
      ...req.body,
      reportType: 'FINANCIAL_ANALYTICS',  // Ensure correct report type
    };

    const newReport = await FinancialAnalyticsReport.create(reportData);
    res.status(201).json({
      status: 'success',
      data: newReport
    });
  } catch (error) {
    next(createError(400, error.message));
  }
});

// READ - Get all financial analytics reports
router.get('/', async (req, res, next) => {
  try {
    const reports = await FinancialAnalyticsReport.find();
    res.status(200).json({
      status: 'success',
      results: reports.length,
      data: reports
    });
  } catch (error) {
    next(createError(500, error.message));
  }
});

// READ - Get a specific financial analytics report by ID
router.get('/:id', async (req, res, next) => {
  try {
    const report = await FinancialAnalyticsReport.findById(req.params.id);
    if (!report) {
      return next(createError(404, 'Report not found'));
    }

    res.status(200).json({
      status: 'success',
      data: report
    });
  } catch (error) {
    next(createError(500, error.message));
  }
});

// UPDATE - Update a financial analytics report
router.put('/:id', async (req, res, next) => {
  try {
    // Update metadata
    req.body.metadata = {
      ...req.body.metadata,
      modifiedAt: new Date(),
      modifiedBy: req.body.metadata?.modifiedBy || 'system'
    };

    const updatedReport = await FinancialAnalyticsReport.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,  // Return updated document
        runValidators: true  // Run schema validators
      }
    );

    if (!updatedReport) {
      return next(createError(404, 'Report not found'));
    }

    res.status(200).json({
      status: 'success',
      data: updatedReport
    });
  } catch (error) {
    next(createError(400, error.message));
  }
});

// DELETE - Delete a financial analytics report
router.delete('/:id', async (req, res, next) => {
  try {
    const deletedReport = await FinancialAnalyticsReport.findByIdAndDelete(req.params.id);
    
    if (!deletedReport) {
      return next(createError(404, 'Report not found'));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(createError(500, error.message));
  }
});

// Additional useful routes

// GET - Filter reports by date range
router.get('/date-range/:startDate/:endDate', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.params;
    
    const reports = await FinancialAnalyticsReport.find({
      'dateRange.startDate': { $gte: new Date(startDate) },
      'dateRange.endDate': { $lte: new Date(endDate) }
    });

    res.status(200).json({
      status: 'success',
      results: reports.length,
      data: reports
    });
  } catch (error) {
    next(createError(400, error.message));
  }
});

// GET - Filter reports by department
router.get('/department/:department', async (req, res, next) => {
  try {
    const reports = await FinancialAnalyticsReport.find({
      department: req.params.department
    });

    res.status(200).json({
      status: 'success',
      results: reports.length,
      data: reports
    });
  } catch (error) {
    next(createError(400, error.message));
  }
});

router.get('/download/:id', async (req, res, next) => {
  try {
    const report = await FinancialAnalyticsReport.findById(req.params.id);
    if (!report) {
      return next(createError(404, 'Report not found'));
    }

    // Generate the report and get the file path
    const outputPath = await generateFinancialReport(report);

    // Send the file to the client
    res.download(outputPath, 'Financial_Report.pdf', (err) => {
      if (err) {
        console.error("Error sending file:", err);
        next(createError(500, 'Error downloading file'));
      }
    });
  } catch (error) {
    next(createError(500, error.message));
  }
});


export default router;
