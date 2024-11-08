import mongoose from "mongoose";

// Base schema for common fields across all report types
const baseReportSchema = new mongoose.Schema({
  reportType: {
    type: String,
    required: true,
    enum: ['PATIENT_HEALTH', 'TREATMENT_OUTCOME', 'HOSPITAL_OPERATIONS', 'FINANCIAL_ANALYTICS'],
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  dateRange: {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    }
  },
  metadata: {
    createdAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: String,
      required: true,
    },
    modifiedAt: {
      type: Date,
      default: null,
    },
    modifiedBy: {
      type: String,
      default: null,
    }
  },
  status: {
    type: String,
    enum: ['DRAFT', 'PENDING_REVIEW', 'FINALIZED', 'ARCHIVED'],
    default: 'DRAFT',
  },
  exportFormat: {
    type: String,
    enum: ['PDF', 'CSV', 'EXCEL', 'JSON'],
    required: true,
  },
}, { discriminatorKey: 'reportType' });

// Patient Health Report Schema
const patientHealthSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Patient', // ref to patient schema
    required: true,
  },
  vitals: [{
    timestamp: Date,
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
    },
    heartRate: Number,
    temperature: Number,
    bloodSugar: Number,
    weight: Number,
  }],
  labResults: [{
    testName: String,
    value: mongoose.Schema.Types.Mixed,
    unit: String,
    referenceRange: String,
    timestamp: Date,
  }],
  summary: {
    type: String,
    required: true,
  }
});

// Treatment Outcome Report Schema
const treatmentOutcomeSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient', // ref to pateint schema
    required: true,
  },
  treatmentId: {
    type: String,
    required: true,
  },
  diagnosis: String,
  treatment: {
    name: String,
    startDate: Date,
    endDate: Date,
    type: String,
  },
  outcomes: {
    preMetrics: mongoose.Schema.Types.Mixed,
    postMetrics: mongoose.Schema.Types.Mixed,
    improvements: [String],
    complications: [String],
  },
  recommendations: String,
});

// Hospital Operations Report Schema
const hospitalOperationsSchema = new mongoose.Schema({
  department: {
    type: String,
    required: false, // Optional if report is hospital-wide
  },
  metrics: {
    admissions: Number,
    discharges: Number,
    bedOccupancy: Number,
    averageLOS: Number, // Length of Stay
    emergencyVisits: Number,
    surgeries: Number,
  },
  staffing: {
    doctorsOnDuty: Number,
    nursesOnDuty: Number,
    supportStaff: Number,
  },
  resources: {
    equipmentUtilization: mongoose.Schema.Types.Mixed,
    medicineInventory: mongoose.Schema.Types.Mixed,
    criticalAlerts: [String],
  },
  analysis: {
    trends: [String],
    bottlenecks: [String],
    recommendations: [String],
  }
});

// Financial Analytics Report Schema
const financialAnalyticsSchema = new mongoose.Schema({
  department: {
    type: String,
    required: false, // Optional if report is hospital-wide
  },
  revenue: {
    total: Number,
    breakdown: {
      consultations: Number,
      procedures: Number,
      pharmacy: Number,
      laboratory: Number,
    }
  },
  expenses: {
    total: Number,
    breakdown: {
      staffing: Number,
      supplies: Number,
      maintenance: Number,
      utilities: Number,
    }
  },
  insurance: {
    claimsSubmitted: Number,
    claimsProcessed: Number,
    claimsPending: Number,
    averageProcessingTime: Number,
  },
  analysis: {
    profitMargin: Number,
    keyMetrics: mongoose.Schema.Types.Mixed,
    recommendations: [String],
  }
});

// Create the base model
export const  BaseReport = mongoose.model('Report', baseReportSchema);

// Create discriminator models for each report type
export const PatientHealthReport = BaseReport.discriminator('PATIENT_HEALTH', patientHealthSchema);
export const TreatmentOutcomeReport = BaseReport.discriminator('TREATMENT_OUTCOME', treatmentOutcomeSchema);
export const HospitalOperationsReport = BaseReport.discriminator('HOSPITAL_OPERATIONS', hospitalOperationsSchema);
export const FinancialAnalyticsReport = BaseReport.discriminator('FINANCIAL_ANALYTICS', financialAnalyticsSchema);
