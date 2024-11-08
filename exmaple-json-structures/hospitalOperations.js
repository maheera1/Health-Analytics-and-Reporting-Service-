// Hospital Operations Report Example
const hospitalOperationsReport = {
reportId: "660e8400-e29b-41d4-a716-446655440000",
reportType: "HOSPITAL_OPERATIONS",
title: "Monthly Operations Summary - Cardiology Department",
description: "Analysis of operational metrics for March 2024",
dateRange: {
    startDate: "2024-03-01T00:00:00Z",
    endDate: "2024-03-31T23:59:59Z"
},
department: "Cardiology",
metrics: {
    admissions: 145,
    discharges: 138,
    bedOccupancy: 85.5,
    averageLOS: 4.2,
    emergencyVisits: 89,
    surgeries: 42
},
staffing: {
    doctorsOnDuty: 12,
    nursesOnDuty: 45,
    supportStaff: 15
},
resources: {
    equipmentUtilization: {
    "ECG Machines": 78,
    "Cardiac Monitors": 92,
    "Ventilators": 65
    },
    medicineInventory: {
    "Critical Medicines": "Adequate",
    "Disposables": "Need Reorder"
    },
    criticalAlerts: [
    "Ventilator maintenance due in 2 weeks",
    "Nurse shortage in night shift"
    ]
},
analysis: {
    trends: [
    "15% increase in emergency admissions",
    "Reduced average length of stay by 0.8 days"
    ],
    bottlenecks: [
    "Peak hour emergency department congestion",
    "Limited ICU beds during weekends"
    ],
    recommendations: [
    "Increase nursing staff for night shifts",
    "Optimize emergency department patient flow"
    ]
},
metadata: {
    createdBy: "Operations Manager",
    createdAt: "2024-04-01T09:00:00Z"
},
status: "FINALIZED",
exportFormat: "EXCEL"
};