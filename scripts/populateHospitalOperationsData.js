// scripts/populateHospitalOperationsData.js
import mongoose from 'mongoose';
import { HospitalOperationsReport } from '../models/HealthAnalyst.schema.js';
import dotenv from 'dotenv';

dotenv.config();

const departments = [
  'Cardiology',
  'Emergency',
  'Surgery',
  'Pediatrics',
  'Orthopedics',
  'Neurology'
];

const equipmentByDepartment = {
  Cardiology: ['ECG Machines', 'Cardiac Monitors', 'Ventilators'],
  Emergency: ['Trauma Kits', 'Defibrillators', 'Monitoring Systems'],
  Surgery: ['Operating Tables', 'Anesthesia Machines', 'Surgical Lights'],
  Pediatrics: ['Incubators', 'Growth Charts', 'Vitals Monitors'],
  Orthopedics: ['X-Ray Machines', 'Physical Therapy Equipment', 'Orthopedic Tools'],
  Neurology: ['EEG Machines', 'MRI Scanner', 'Neurostimulators']
};

const generateRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const generateDateRange = (baseDate) => {
  const startDate = new Date(baseDate);
  const endDate = new Date(baseDate);
  endDate.setDate(endDate.getDate() + 30); // 30 day range
  return { startDate, endDate };
};

const generateMetrics = () => ({
  admissions: Math.floor(Math.random() * 200) + 50,
  discharges: Math.floor(Math.random() * 180) + 45,
  bedOccupancy: Math.floor(Math.random() * 30) + 70, // 70-100%
  averageLOS: Math.floor(Math.random() * 5) + 2, // 2-7 days
  emergencyVisits: Math.floor(Math.random() * 150) + 30,
  surgeries: Math.floor(Math.random() * 80) + 20
});

const generateStaffing = () => ({
  doctorsOnDuty: Math.floor(Math.random() * 15) + 5,
  nursesOnDuty: Math.floor(Math.random() * 40) + 20,
  supportStaff: Math.floor(Math.random() * 20) + 10
});

const generateResources = (department) => {
  const equipment = {};
  equipmentByDepartment[department].forEach(item => {
    equipment[item] = Math.floor(Math.random() * 30) + 70; // 70-100% utilization
  });

  return {
    equipmentUtilization: equipment,
    medicineInventory: {
      'Critical Medicines': Math.random() > 0.3 ? 'Adequate' : 'Need Reorder',
      'Disposables': Math.random() > 0.5 ? 'Adequate' : 'Need Reorder'
    },
    criticalAlerts: Math.random() > 0.5 ? [
      'Equipment maintenance due',
      'Staff shortage in specific shift',
      'Low inventory alert'
    ].slice(0, Math.floor(Math.random() * 3) + 1) : []
  };
};

const generateAnalysis = (metrics) => ({
  trends: [
    `${Math.floor(Math.random() * 20)}% ${Math.random() > 0.5 ? 'increase' : 'decrease'} in admissions`,
    `Average LOS ${Math.random() > 0.5 ? 'improved' : 'increased'} by ${(Math.random() * 2).toFixed(1)} days`
  ],
  bottlenecks: [
    'Peak hour department congestion',
    'Limited bed availability',
    'Staff scheduling challenges'
  ].slice(0, Math.floor(Math.random() * 3) + 1),
  recommendations: [
    'Optimize staff scheduling',
    'Improve equipment maintenance schedule',
    'Review inventory management process'
  ].slice(0, Math.floor(Math.random() * 3) + 1)
});

const generateReport = (baseDate, department) => {
  const dateRange = generateDateRange(baseDate);
  const metrics = generateMetrics();

  return {
    reportType: 'HOSPITAL_OPERATIONS',
    title: `Monthly Operations Summary - ${department}`,
    description: `Analysis of operational metrics for ${dateRange.startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
    dateRange,
    department,
    metrics,
    staffing: generateStaffing(),
    resources: generateResources(department),
    analysis: generateAnalysis(metrics),
    metadata: {
      createdBy: 'System Generator',
      createdAt: new Date(),
    },
    status: ['DRAFT', 'FINALIZED', 'PENDING_REVIEW'][Math.floor(Math.random() * 3)],
    exportFormat: ['PDF', 'EXCEL', 'CSV'][Math.floor(Math.random() * 3)]
  };
};


const populateData = async () => {
    try {
      await mongoose.connect("mongodb://127.0.0.1:27017/HealthAnalytics");
      console.log('Connected to MongoDB');
  
      await HospitalOperationsReport.deleteMany({});
  
      const reports = [];
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-01');
      
      // Create 10-day periods
      const datePeriods = [];
      let currentDate = new Date(startDate);
      
      while (currentDate < endDate) {
        const periodStart = new Date(currentDate);
        const periodEnd = new Date(currentDate);
        periodEnd.setDate(periodEnd.getDate() + 9); // 10 day periods
        
        // Generate one consolidated report per period
        const report = {
          reportType: 'HOSPITAL_OPERATIONS',
          title: `Hospital Operations Summary`,
          description: `Analysis of operational metrics for ${periodStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' })} to ${periodEnd.toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' })}`,
          dateRange: {
            startDate: periodStart,
            endDate: periodEnd
          },
          department: 'All Departments',
          metrics: generateMetrics(),
          staffing: generateStaffing(),
          resources: generateResources('Emergency'), // using Emergency as base for equipment
          analysis: generateAnalysis(),
          metadata: {
            createdBy: 'System Generator',
            createdAt: new Date(),
          },
          status: ['DRAFT', 'FINALIZED', 'PENDING_REVIEW'][Math.floor(Math.random() * 3)],
          exportFormat: ['PDF', 'EXCEL', 'CSV'][Math.floor(Math.random() * 3)]
        };
        
        reports.push(report);
        
        // Move to next period
        currentDate.setDate(currentDate.getDate() + 10);
      }
  
      await HospitalOperationsReport.insertMany(reports);
      console.log(`Successfully inserted ${reports.length} reports`);
      console.log(`Generated one report per 10-day period from Jan to Dec 2024`);
  
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
  
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  };
  
  populateData();