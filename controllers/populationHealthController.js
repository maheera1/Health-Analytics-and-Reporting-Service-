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


// Get disease distribution
// controllers/populationHealthController.js
export const getDiseaseDistribution = asyncHandler(async (req, res) => {
  const diseaseStats = await PatientHealthReport.aggregate([
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
        _id: '$patient.diagnosis', // Changed from '$diagnosis' to '$patient.diagnosis'
        count: { $sum: 1 },
        avgAge: {
          $avg: {
            $divide: [
              { $subtract: [new Date(), '$patient.dateOfBirth'] },
              31557600000 // milliseconds in year
            ]
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
    {
      $project: {
        count: 1,
        avgAge: 1,
        genderDistribution: {
          male: '$maleCount',
          female: '$femaleCount',
          other: '$otherCount'
        }
      }
    },
    {
      $match: {
        _id: { $ne: null } // Filter out null diagnoses
      }
    }
  ]);

  res.json({
    success: true,
    data: diseaseStats
  });
});

// Get demographic patterns
export const getDemographicPatterns = asyncHandler(async (req, res) => {
  const patterns = await PatientHealthReport.aggregate([
    {
      $lookup: {
        from: 'patients',
        localField: 'patientId',
        foreignField: '_id',
        as: 'patient'
      }
    },
    { $unwind: '$patient' },
    { $unwind: '$vitals' },
    {
      $group: {
        _id: '$patient.bloodType',
        count: { $sum: 1 },
        avgSystolic: { $avg: '$vitals.bloodPressure.systolic' },
        avgDiastolic: { $avg: '$vitals.bloodPressure.diastolic' },
        avgBloodSugar: { $avg: '$vitals.bloodSugar' },
        conditions: { $addToSet: '$diagnosis' }
      }
    },
    {
      $project: {
        count: 1,
        avgBloodPressure: {
          systolic: '$avgSystolic',
          diastolic: '$avgDiastolic'
        },
        avgBloodSugar: 1,
        conditions: 1
      }
    },
    {
      $match: {
        _id: { $ne: null }
      }
    }
  ]);

  res.json({
    success: true,
    data: patterns
  });
});