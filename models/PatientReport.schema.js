const mongoose = require('mongoose');

const patientReportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    required: true,
    unique: true,
    match: /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
  },
  patientId: {
    type: String,
    required: true,
    match: /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
  },
  reportType: {
    type: String,
    required: true,
    enum: ['Routine', 'Urgent', 'Follow-Up', 'Stat'], // Allowed types
  },
  creationDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  reportData: {
    type: Object,
    required: true,
  },
  status: {
    type: String,
    enum: ['Draft', 'Finalized', 'Archived'],
    default: 'Draft',
  },
  exportFormat: {
    type: String,
    enum: ['PDF', 'CSV', 'Excel'],
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  modifiedDate: {
    type: Date,
    default: null,
  },
  modifiedBy: {
    type: String,
    default: null,
  },
});

const PatientReport = mongoose.model('PatientReport', patientReportSchema);
module.exports = PatientReport;
