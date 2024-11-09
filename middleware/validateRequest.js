import Joi from 'joi';
import { createError } from './errorTypes.js';

// Define the validation schema for PatientHealth report
const patientHealthSchema = Joi.object({
  patientId: Joi.string().required(),
  vitals: Joi.array().items(
    Joi.object({
      timestamp: Joi.date().required(),
      bloodPressure: Joi.object({
        systolic: Joi.number().min(0).required(),
        diastolic: Joi.number().min(0).required(),
      }).required(),
      heartRate: Joi.number().min(0).required(),
      temperature: Joi.number().min(0).required(),
      bloodSugar: Joi.number().min(0).required(),
      weight: Joi.number().min(0).required(),
    })
  ).required(),
  labResults: Joi.array().items(
    Joi.object({
      testName: Joi.string().required(),
      value: Joi.any().required(),
      unit: Joi.string().allow(null, ''),
      referenceRange: Joi.string().allow(null, ''),
      timestamp: Joi.date().required(),
    })
  ),
  summary: Joi.string().required(),
  title: Joi.string().required(),
  dateRange: Joi.object({
    startDate: Joi.date().required(),
    endDate: Joi.date().required()
  }).required(),
  metadata: Joi.object({
    createdBy: Joi.string().required(),
    createdAt: Joi.date().required(),
  }).required(),
  exportFormat: Joi.string().valid('PDF', 'CSV', 'EXCEL', 'JSON').required()
});

// Middleware to validate request body against a Joi schema
export const validateRequest = (schema) => (req, _res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const message = error.details.map(detail => detail.message).join(', ');
      return next(createError(400, message));
    }
    next();
};

// Export validatePatientHealthRequest middleware
export const validatePatientHealthRequest = validateRequest(patientHealthSchema);
