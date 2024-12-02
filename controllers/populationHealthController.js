// controllers/populationHealthController.js
import { asyncHandler } from '../middleware/asyncHandler.js';
import { PatientHealthReport } from '../models/HealthAnalyst.schema.js';
import Patient from '../models/Patient.schema.js';

// Get age distribution
export const getAgeDistribution = asyncHandler(async (req, res) => {
  const ageGroups = await PatientHealthReport.aggregate([
    {
      $lookup: {
        from: 'patients',
        localField: 'patientId',
        foreignField: '_id',
        as: 'patient'
      }
    },
    { $unwind: '$patient' },
    {
      $group: {
        _id: {
          $function: {
            body: function(dob) {
              const age = Math.floor((new Date() - new Date(dob)) / 31557600000);
              if (age < 18) return '0-17';
              if (age < 30) return '18-29';
              if (age < 45) return '30-44';
              if (age < 60) return '45-59';
              return '60+';
            },
            args: ['$patient.dateOfBirth'],
            lang: 'js'
          }
        },
        maleCount: {
          $sum: { $cond: [{ $eq: ['$patient.gender', 'Male'] }, 1, 0] }
        },
        femaleCount: {
          $sum: { $cond: [{ $eq: ['$patient.gender', 'Female'] }, 1, 0] }
        },
        otherCount: {
          $sum: { $cond: [{ $eq: ['$patient.gender', 'Other'] }, 1, 0] }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({
    success: true,
    data: ageGroups
  });
});

// Get vital signs distribution
export const getVitalsDistribution = asyncHandler(async (req, res) => {
  const vitalsStats = await PatientHealthReport.aggregate([
    { $unwind: '$vitals' },
    {
      $group: {
        _id: null,
        avgSystolic: { $avg: '$vitals.bloodPressure.systolic' },
        avgDiastolic: { $avg: '$vitals.bloodPressure.diastolic' },
        avgHeartRate: { $avg: '$vitals.heartRate' },
        avgTemperature: { $avg: '$vitals.temperature' },
        avgBloodSugar: { $avg: '$vitals.bloodSugar' },
        avgWeight: { $avg: '$vitals.weight' }
      }
    }
  ]);

  res.json({
    success: true,
    data: vitalsStats[0]
  });
});