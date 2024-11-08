// Financial Analytics Report Example
const financialAnalyticsReport = {
reportType: "FINANCIAL_ANALYTICS",
title: "Q1 2024 Financial Performance",
description: "Comprehensive financial review for the hospital",
dateRange: {
    startDate: "2024-01-01T00:00:00Z",
    endDate: "2024-03-31T23:59:59Z"
},
department: null, // Hospital-wide report
revenue: {
    total: 42500000,
    breakdown: {
    consultations: 12000000,
    procedures: 18000000,
    pharmacy: 8000000,
    laboratory: 4500000
    }
},
expenses: {
    total: 38000000,
    breakdown: {
    staffing: 22000000,
    supplies: 8000000,
    maintenance: 4500000,
    utilities: 3500000
    }
},
insurance: {
    claimsSubmitted: 25000,
    claimsProcessed: 22000,
    claimsPending: 3000,
    averageProcessingTime: 12 // days
},
analysis: {
    profitMargin: 0.106, // 10.6%
    keyMetrics: {
    revenuePerBed: 85000,
    costPerPatient: 1520,
    claimsDenialRate: 0.12
    },
    recommendations: [
    "Optimize revenue cycle management to reduce claim denials",
    "Explore cost-saving initiatives in supplies and utilities",
    "Invest in staff retention to maintain high-quality care"
    ]
},
metadata: {
    createdBy: "Chief Financial Officer",
    createdAt: "2024-04-15T10:00:00Z"
},
status: "FINALIZED",
exportFormat: "EXCEL"
};