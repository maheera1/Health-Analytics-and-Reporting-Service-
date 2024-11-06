const mongoose = require('mongoose');

// Health Analytics Reporting Service Schema
const healthAnalyticsReportingServiceSchema = new mongoose.Schema({
  reportId: {
    type: String,
    required: true,
    unique: true,
    match: /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/, // UUID format
  },
  reportType: {
    type: String,
    required: true,
    enum: ['Routine', 'Urgent', 'Follow-Up', 'Stat'], // Defining allowed report types
  },
  creationDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  patientId: {
    type: String,
    required: true,
    match: /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/, // UUID format
  },
  reportData: {
    parameters: {
      type: Object,
      additionalProperties: true, // Allows dynamic key-value pairs
      required: true, // Ensuring parameters are always provided
    },
    data: [{
      type: Object,
      required: true, // Each entry in data is required
      additionalProperties: true, // Allows dynamic key-value pairs
    }],
    analysis: {
      type: Object,
      additionalProperties: true, // Allows dynamic key-value pairs
      required: true, // Ensuring analysis is always provided
    },
  },
  exportFormat: {
    type: String,
    required: true,
    enum: ['PDF', 'CSV', 'Excel'], // Allowed export formats
  },
  status: {
    type: String,
    enum: ['Draft', 'Finalized', 'Archived'], // Status of the report
    default: 'Draft',
  },
  createdBy: {
    type: String,
    required: true, // ID of the user who created the report
  },
  modifiedDate: {
    type: Date,
    default: null, // Timestamp for when the report was last modified
  },
  modifiedBy: {
    type: String,
    default: null, // ID of the user who last modified the report
  },
});

const HealthAnalyticsReportingService = mongoose.model('HealthAnalyticsReportingService', healthAnalyticsReportingServiceSchema);
module.exports = HealthAnalyticsReportingService;