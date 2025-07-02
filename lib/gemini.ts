import { GoogleGenerativeAI } from '@google/generative-ai';
import { LabResult } from './parser';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function analyzeLabReportWithGemini(extractedText: string): Promise<LabResult[]> {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are a medical lab report analysis expert. Analyze the following medical lab report text and extract ALL health parameters with their values, units, and reference ranges.

CRITICAL INSTRUCTIONS:
1. Extract EVERY numeric health parameter you can find
2. Return ONLY valid JSON - no explanations, no markdown, no additional text
3. Include common parameters like: Hemoglobin, WBC, RBC, Platelets, Glucose, Cholesterol, Triglycerides, Creatinine, BUN, ALT, AST, etc.
4. For each parameter, determine if the value is Normal, High, or Low based on standard reference ranges
5. If no reference range is provided, use standard medical reference ranges

Return a JSON array in this EXACT format:
[
  {
    "parameter": "Parameter Name",
    "value": "numeric_value_only",
    "unit": "unit_abbreviation",
    "range": {
      "low": numeric_low_value,
      "high": numeric_high_value
    },
    "status": "Normal|High|Low"
  }
]

Standard Reference Ranges to use if not provided:
- Hemoglobin: 12.0-16.0 g/dL
- WBC: 4000-11000 cells/μL
- RBC: 4.2-5.8 million cells/μL
- Platelets: 150000-450000 cells/μL
- Glucose: 70-100 mg/dL
- Total Cholesterol: <200 mg/dL
- HDL Cholesterol: >40 mg/dL
- LDL Cholesterol: <100 mg/dL
- Triglycerides: <150 mg/dL
- Creatinine: 0.6-1.2 mg/dL
- BUN: 7-20 mg/dL
- ALT: 7-45 U/L
- AST: 8-40 U/L

Lab Report Text:
${extractedText}

JSON Response:`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean up the response to ensure it's valid JSON
        text = text.trim();

        // Remove any markdown code blocks
        text = text.replace(/```json\s*|\s*```/g, '');
        text = text.replace(/```\s*|\s*```/g, '');

        // Remove any leading/trailing text that isn't JSON
        const jsonStart = text.indexOf('[');
        const jsonEnd = text.lastIndexOf(']') + 1;

        if (jsonStart !== -1 && jsonEnd !== -1) {
            text = text.substring(jsonStart, jsonEnd);
        }

        console.log('Gemini response:', text);

        const labResults: LabResult[] = JSON.parse(text);

        // Validate and clean the results
        return labResults.filter(result =>
            result.parameter &&
            result.value &&
            result.unit &&
            result.range &&
            typeof result.range.low === 'number' &&
            typeof result.range.high === 'number'
        ).map(result => ({
            ...result,
            value: result.value.toString(),
            status: determineStatus(parseFloat(result.value), result.range)
        }));

    } catch (error) {
        console.error('Gemini analysis error:', error);
        throw new Error('Failed to analyze lab report with Gemini');
    }
}

function determineStatus(value: number, range: { low: number; high: number }): 'Normal' | 'High' | 'Low' {
    if (value < range.low) return 'Low';
    if (value > range.high) return 'High';
    return 'Normal';
}

export async function getLabInsights(results: LabResult[]): Promise<string> {
    if (!process.env.GEMINI_API_KEY) {
        return 'Gemini API key not configured for insights.';
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const abnormalResults = results.filter(r => r.status !== 'Normal');

    if (abnormalResults.length === 0) {
        return 'All your lab values appear to be within normal ranges. This is generally a positive indicator of good health.';
    }

    const prompt = `
As a medical analysis AI, provide a brief, professional summary of these lab results. Focus on the abnormal values and their potential health implications.

Lab Results:
${results.map(r => `${r.parameter}: ${r.value} ${r.unit} (${r.status}) - Normal range: ${r.range.low}-${r.range.high}`).join('\n')}

Provide a concise 2-3 sentence summary focusing on:
1. Which values are abnormal
2. General health implications (not specific medical advice)
3. Recommendation to consult healthcare provider

Keep it professional and avoid giving specific medical advice.
`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Insights generation error:', error);
        return 'Unable to generate insights at this time.';
    }
} 