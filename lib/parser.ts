export interface LabResult {
    parameter: string;
    value: string;
    unit: string;
    range: {
        low: number;
        high: number;
    };
    status: 'Normal' | 'High' | 'Low' | 'Needs Attention';
}

// Common lab parameter patterns and their reference ranges
const LAB_PATTERNS = [
    {
        name: 'Hemoglobin',
        pattern: /(?:hemoglobin|hgb|hb)\s*:?\s*([0-9.]+)\s*(g\/dl|g\/dL|gm\/dl)/i,
        unit: 'g/dL',
        range: { low: 12.0, high: 16.0 }
    },
    {
        name: 'White Blood Cell Count',
        pattern: /(?:wbc|white blood cell|leucocyte)\s*:?\s*([0-9.]+)\s*(?:x10|×10)?\^?3?\s*(?:\/ul|\/μl|cells\/ul)/i,
        unit: 'cells/μL',
        range: { low: 4000, high: 11000 }
    },
    {
        name: 'Red Blood Cell Count',
        pattern: /(?:rbc|red blood cell)\s*:?\s*([0-9.]+)\s*(?:x10|×10)?\^?6?\s*(?:\/ul|\/μl|cells\/ul)/i,
        unit: 'cells/μL',
        range: { low: 4.2, high: 5.8 }
    },
    {
        name: 'Platelet Count',
        pattern: /(?:platelet|plt)\s*:?\s*([0-9.]+)\s*(?:x10|×10)?\^?3?\s*(?:\/ul|\/μl|cells\/ul)/i,
        unit: 'cells/μL',
        range: { low: 150000, high: 450000 }
    },
    {
        name: 'Glucose',
        pattern: /(?:glucose|blood glucose|bg)\s*:?\s*([0-9.]+)\s*(mg\/dl|mg\/dL|mmol\/l)/i,
        unit: 'mg/dL',
        range: { low: 70, high: 100 }
    },
    {
        name: 'Cholesterol',
        pattern: /(?:cholesterol|total cholesterol)\s*:?\s*([0-9.]+)\s*(mg\/dl|mg\/dL|mmol\/l)/i,
        unit: 'mg/dL',
        range: { low: 0, high: 200 }
    },
    {
        name: 'HDL Cholesterol',
        pattern: /(?:hdl|hdl cholesterol)\s*:?\s*([0-9.]+)\s*(mg\/dl|mg\/dL|mmol\/l)/i,
        unit: 'mg/dL',
        range: { low: 40, high: 100 }
    },
    {
        name: 'LDL Cholesterol',
        pattern: /(?:ldl|ldl cholesterol)\s*:?\s*([0-9.]+)\s*(mg\/dl|mg\/dL|mmol\/l)/i,
        unit: 'mg/dL',
        range: { low: 0, high: 100 }
    },
    {
        name: 'Triglycerides',
        pattern: /(?:triglycerides|tg)\s*:?\s*([0-9.]+)\s*(mg\/dl|mg\/dL|mmol\/l)/i,
        unit: 'mg/dL',
        range: { low: 0, high: 150 }
    },
    {
        name: 'Creatinine',
        pattern: /(?:creatinine|creat)\s*:?\s*([0-9.]+)\s*(mg\/dl|mg\/dL|μmol\/l)/i,
        unit: 'mg/dL',
        range: { low: 0.6, high: 1.2 }
    },
    {
        name: 'Blood Urea Nitrogen',
        pattern: /(?:bun|blood urea nitrogen|urea)\s*:?\s*([0-9.]+)\s*(mg\/dl|mg\/dL|mmol\/l)/i,
        unit: 'mg/dL',
        range: { low: 7, high: 20 }
    },
    {
        name: 'ALT',
        pattern: /(?:alt|alanine aminotransferase|sgpt)\s*:?\s*([0-9.]+)\s*(u\/l|iu\/l|units\/l)/i,
        unit: 'U/L',
        range: { low: 7, high: 45 }
    },
    {
        name: 'AST',
        pattern: /(?:ast|aspartate aminotransferase|sgot)\s*:?\s*([0-9.]+)\s*(u\/l|iu\/l|units\/l)/i,
        unit: 'U/L',
        range: { low: 8, high: 40 }
    }
];

function determineStatus(value: number, range: { low: number; high: number }): 'Normal' | 'High' | 'Low' | 'Needs Attention' {
    if (value < range.low) return 'Low';
    if (value > range.high) return 'High';
    return 'Normal';
}

export function parseLabResults(ocrText: string): LabResult[] {
    const results: LabResult[] = [];
    const lines = ocrText.split('\n');

    for (const pattern of LAB_PATTERNS) {
        for (const line of lines) {
            const match = line.match(pattern.pattern);
            if (match) {
                const value = parseFloat(match[1]);
                const extractedUnit = match[2] || pattern.unit;

                const result: LabResult = {
                    parameter: pattern.name,
                    value: value.toString(),
                    unit: extractedUnit,
                    range: pattern.range,
                    status: determineStatus(value, pattern.range)
                };

                // Avoid duplicates
                if (!results.some(r => r.parameter === pattern.name)) {
                    results.push(result);
                }
                break;
            }
        }
    }

    // Generic pattern for other numeric values with units
    const genericPattern = /([A-Za-z\s]+)\s*:?\s*([0-9.]+)\s*([a-zA-Z\/μ%]+)/g;
    let match;

    while ((match = genericPattern.exec(ocrText)) !== null) {
        const parameter = match[1].trim();
        const value = parseFloat(match[2]);
        const unit = match[3];

        // Skip if we already have this parameter or if it's too generic
        if (results.some(r => r.parameter.toLowerCase().includes(parameter.toLowerCase())) ||
            parameter.length < 3) {
            continue;
        }

        results.push({
            parameter,
            value: value.toString(),
            unit,
            range: { low: 0, high: 999999 }, // Default range for unknown parameters
            status: 'Normal'
        });

        if (results.length > 20) break; // Limit results to prevent spam
    }

    return results;
}

export function generateDummyHistoricalData(parameter: string): Array<{ date: string; value: number }> {
    const data = [];
    const baseValue = getBaseValueForParameter(parameter);
    const dates = [];

    // Generate 6 months of dummy data
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        dates.push(date.toISOString().split('T')[0]);
    }

    for (const date of dates) {
        // Add some random variation (±20%)
        const variation = 1 + (Math.random() - 0.5) * 0.4;
        data.push({
            date,
            value: Math.round(baseValue * variation * 100) / 100
        });
    }

    return data;
}

function getBaseValueForParameter(parameter: string): number {
    const baselines: { [key: string]: number } = {
        'Hemoglobin': 14.0,
        'White Blood Cell Count': 7500,
        'Red Blood Cell Count': 4.8,
        'Platelet Count': 300000,
        'Glucose': 85,
        'Cholesterol': 180,
        'HDL Cholesterol': 50,
        'LDL Cholesterol': 80,
        'Triglycerides': 120,
        'Creatinine': 0.9,
        'Blood Urea Nitrogen': 15,
        'ALT': 25,
        'AST': 30
    };

    return baselines[parameter] || 50;
} 