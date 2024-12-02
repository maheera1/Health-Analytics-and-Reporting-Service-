// controllers/temporalAnalyticsController.js
import { asyncHandler } from '../middleware/asyncHandler.js';
import { HospitalOperationsReport } from '../models/HealthAnalyst.schema.js';

// controllers/temporalAnalyticsController.js
export const getTemporalAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate, department } = req.query;
  
  // Convert dates to start/end of day
  const end = endDate 
    ? new Date(new Date(endDate).setHours(23, 59, 59, 999))
    : new Date(new Date().setHours(23, 59, 59, 999));
    
  const start = startDate 
    ? new Date(new Date(startDate).setHours(0, 0, 0, 0))
    : new Date(new Date(end).setDate(end.getDate() - 7));

  const query = {
    'dateRange.startDate': { $gte: start },
    'dateRange.endDate': { $lte: end }
  };

  if (department) {
    query.department = department;
  }


  const reports = await HospitalOperationsReport.find(query)
    .sort({ 'dateRange.startDate': 1 });

  // Format response data
  const formattedData = reports.map(report => ({
    date: report.dateRange.startDate,
    metrics: {
      admissions: report.metrics.admissions,
      discharges: report.metrics.discharges,
      bedOccupancy: report.metrics.bedOccupancy,
      emergencyVisits: report.metrics.emergencyVisits,
      surgeries: report.metrics.surgeries
    }
  }));


  res.json({
    success: true,
    data: formattedData
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


// aggregated metrics
export const getAggregatedMetrics = asyncHandler(async (req, res) => {
    const { startDate, endDate, department } = req.query;
    
    const query = {
      'dateRange.startDate': { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      }
    };
  
    if (department) query.department = department;
  
    const aggregatedData = await HospitalOperationsReport.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: "$dateRange.startDate" },
            month: { $month: "$dateRange.startDate" },
            day: { $dayOfMonth: "$dateRange.startDate" }
          },
          totalAdmissions: { $sum: "$metrics.admissions" },
          totalDischarges: { $sum: "$metrics.discharges" },
          avgBedOccupancy: { $avg: "$metrics.bedOccupancy" },
          totalEmergencyVisits: { $sum: "$metrics.emergencyVisits" },
          totalSurgeries: { $sum: "$metrics.surgeries" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    console.log("aggregatedData", aggregatedData)
    res.json({
      success: true,
      data: aggregatedData
    });
  });