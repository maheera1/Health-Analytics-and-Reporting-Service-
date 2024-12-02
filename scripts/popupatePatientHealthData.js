// scripts/populatePatientHealthData.js
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import { PatientHealthReport } from '../models/HealthAnalyst.schema.js';
import Patient from '../models/Patient.schema.js';
import dotenv from 'dotenv';

dotenv.config();

const generateRandomVitals = () => ({
  timestamp: faker.date.recent(),
  bloodPressure: {
    systolic: faker.number.int({ min: 90, max: 180 }),
    diastolic: faker.number.int({ min: 60, max: 120 })
  },
  heartRate: faker.number.int({ min: 60, max: 100 }),
  temperature: faker.number.float({ min: 36.1, max: 37.8, precision: 0.1 }),
  bloodSugar: faker.number.int({ min: 70, max: 180 }),
  weight: faker.number.float({ min: 45, max: 120, precision: 0.1 })
});

const labTests = [
  { name: 'Hemoglobin', unit: 'g/dL', min: 12, max: 17, reference: '12-17' },
  { name: 'White Blood Cells', unit: 'K/µL', min: 4, max: 11, reference: '4.0-11.0' },
  { name: 'Platelets', unit: 'K/µL', min: 150, max: 450, reference: '150-450' },
  { name: 'Cholesterol', unit: 'mg/dL', min: 150, max: 300, reference: '150-200' },
  { name: 'Blood Glucose', unit: 'mg/dL', min: 70, max: 180, reference: '70-100' }
];

const generateRandomLabResults = () => 
  labTests.map(test => ({
    testName: test.name,
    value: faker.number.float({ min: test.min, max: test.max, precision: 0.1 }),
    unit: test.unit,
    referenceRange: test.reference,
    timestamp: faker.date.recent()
  }));

const generatePatient = () => ({
  name: faker.person.fullName(),
  dateOfBirth: faker.date.past({ years: 70, refDate: new Date(2005, 0, 1) }),
  gender: faker.helpers.arrayElement(['Male', 'Female', 'Other']),
  contactInfo: {
    phone: faker.phone.number(),
    email: faker.internet.email(),
    address: faker.location.streetAddress()
  },
  bloodType: faker.helpers.arrayElement(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
});

// scripts/populatePatientHealthData.js
// Update the generateHealthReport function:

const generateHealthReport = (patientId) => {
    const startDate = faker.date.recent();
    const endDate = faker.date.soon({ days: 30, refDate: startDate }); // Generate end date within 30 days of start date
  
    return {
      reportType: 'PATIENT_HEALTH',
      title: 'Regular Health Checkup',
      description: 'Routine health examination and lab work',
      dateRange: {
        startDate,
        endDate
      },
      patientId,
      vitals: Array(5).fill().map(() => generateRandomVitals()),
      labResults: generateRandomLabResults(),
      summary: faker.lorem.paragraph(),
      metadata: {
        createdBy: 'System Generator',
        createdAt: new Date()
      },
      status: faker.helpers.arrayElement(['DRAFT', 'PENDING_REVIEW', 'FINALIZED']),
      exportFormat: faker.helpers.arrayElement(['PDF', 'CSV', 'EXCEL'])
    };
  };
const populateData = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/HealthAnalytics");
    console.log('Connected to MongoDB');

    await Patient.deleteMany({});
    await PatientHealthReport.deleteMany({});

    const patients = await Patient.insertMany(
      Array(50).fill().map(() => generatePatient())
    );

    const healthReports = [];
    for (const patient of patients) {
      const numReports = faker.number.int({ min: 2, max: 5 });
      for (let i = 0; i < numReports; i++) {
        healthReports.push(generateHealthReport(patient._id));
      }
    }

    await PatientHealthReport.insertMany(healthReports);

    console.log(`Successfully inserted ${patients.length} patients`);
    console.log(`Successfully inserted ${healthReports.length} health reports`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

populateData();