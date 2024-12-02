// controllers/temporalAnalyticsController.js
import { asyncHandler } from '../middleware/asyncHandler.js';
import { HospitalOperationsReport } from '../models/HealthAnalyst.schema.js';

export const getTemporalAnalytics = asyncHandler(async (req, res) => {
    const { startDate, endDate, department } = req.query;
    
    // Default to last 7 days if no dates provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end - 7 * 24 * 60 * 60 * 1000);
  
    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Please use ISO format (YYYY-MM-DD)'
      });
    }
  
    const query = {
      'dateRange.startDate': { $gte: start },
      'dateRange.endDate': { $lte: end }
    };
  
    if (department) {
      query.department = department;
    }
  
    const reports = await HospitalOperationsReport.find(query)
      .sort({ 'dateRange.startDate': 1 });
  
    res.json({
      success: true,
      data: reports
    });
  });

// Get patterns by time of day
export const getDailyPatterns = asyncHandler(async (req, res) => {
  const { date, department } = req.query;

  const dayStart = new Date(date);
  const dayEnd = new Date(date);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const reports = await HospitalOperationsReport.find({
    'dateRange.startDate': { $gte: dayStart, $lt: dayEnd },
    ...(department && { department })
  });

  res.json({
    success: true,
    data: reports
  });
});