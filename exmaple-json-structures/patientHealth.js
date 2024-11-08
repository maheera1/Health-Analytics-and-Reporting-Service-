// Patient Health Report Example
const patientHealthReport = {
  reportId: "550e8400-e29b-41d4-a716-446655440000",
  reportType: "PATIENT_HEALTH",
  title: "Quarterly Health Assessment - John Doe",
  description: "Comprehensive health status review for Q1 2024",
  dateRange: {
    startDate: "2024-01-01T00:00:00Z",
    endDate: "2024-03-31T23:59:59Z"
  },
  patientId: "7891011-e29b-41d4-a716-446655440000",
  vitals: [
    {
      timestamp: "2024-03-31T10:00:00Z",
      bloodPressure: {
        systolic: 120,
        diastolic: 80
      },
      heartRate: 72,
      temperature: 98.6,
      bloodSugar: 95,
      weight: 70
    }
  ],
  labResults: [
    {
      testName: "Complete Blood Count",
      value: {
        hemoglobin: 14,
        wbc: 7500,
        platelets: 250000
      },
      unit: "g/dL, cells/mcL",
      referenceRange: "13.5-17.5 g/dL",
      timestamp: "2024-03-30T09:00:00Z"
    }
  ],
  summary: "Patient's vital signs and lab results are within normal ranges.",
  metadata: {
    createdBy: "Dr. Smith",
    createdAt: "2024-03-31T11:00:00Z"
  },
  status: "FINALIZED",
  exportFormat: "PDF"
};
