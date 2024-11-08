// Treatment Outcome Report Example
const treatmentOutcomeReport = {
reportType: "TREATMENT_OUTCOME",
title: "Treatment Effectiveness Review - Mrs. Jane Doe",
description: "Evaluation of diabetes treatment plan",
dateRange: {
    startDate: "2023-06-01T00:00:00Z",
    endDate: "2024-05-31T23:59:59Z"
},
patientId: "8901112-e29b-41d4-a716-446655440000",
treatmentId: "a1b2c3d4-e5f6-4321-8765-4321fedcba09",
diagnosis: "Type 2 Diabetes",
treatment: {
    name: "Insulin Therapy",
    startDate: "2023-06-01T00:00:00Z",
    endDate: "2024-05-31T23:59:59Z",
    type: "Medication"
},
outcomes: {
    preMetrics: {
    bloodSugar: 210,
    a1c: 9.5,
    weight: 180
    },
    postMetrics: {
    bloodSugar: 120,
    a1c: 7.2, 
    weight: 165
    },
    improvements: [
    "Reduced blood sugar levels",
    "Lowered A1C percentage",
    "Achieved weight loss goal"
    ],
    complications: [
    "Experienced minor hypoglycemic episodes"
    ]
},
recommendations: "Continue insulin therapy with close monitoring. Consider adjusting dosage to minimize hypoglycemic events.",
metadata: {
    createdBy: "Dr. Johnson",
    createdAt: "2024-06-01T14:30:00Z"
},
status: "FINALIZED",
exportFormat: "PDF"
};

