import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import { extractTextFromFile } from '../../lib/ocr';
import { parseLabResults, LabResult } from '../../lib/parser';
import { analyzeLabReportWithGemini, getLabInsights } from '../../lib/gemini';

export const config = {
    api: {
        bodyParser: false,
    },
};

const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/bmp',
];

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const form = new IncomingForm();

        const { files } = await new Promise<{ files: any }>((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                else resolve({ files });
            });
        });

        const file = Array.isArray(files.file) ? files.file[0] : files.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Validate file type
        const mimeType = file.mimetype || file.type;
        if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
            return res.status(400).json({
                error: 'Invalid file type. Please upload PDF, PNG, JPEG, or other supported image formats.'
            });
        }

        // Read file buffer
        const filePath = file.filepath || file.path;
        const fileBuffer = await fs.readFile(filePath);

        // Extract text using OCR
        console.log('Starting OCR extraction...');
        const extractedText = await extractTextFromFile(fileBuffer, mimeType);

        if (!extractedText || extractedText.trim().length === 0) {
            return res.status(400).json({
                error: 'Could not extract text from the uploaded file. Please ensure the file contains readable text.'
            });
        }

        console.log('Extracted text:', extractedText.substring(0, 200) + '...');

        // Try Gemini analysis first, fallback to basic parsing
        let labResults: LabResult[] = [];
        let insights = '';
        let analysisMethod = 'basic';

        try {
            if (process.env.GEMINI_API_KEY) {
                console.log('Using Gemini AI for intelligent analysis...');
                labResults = await analyzeLabReportWithGemini(extractedText);
                analysisMethod = 'gemini';

                if (labResults.length > 0) {
                    insights = await getLabInsights(labResults);
                }
            } else {
                console.log('GEMINI_API_KEY not found, falling back to basic parsing...');
                labResults = parseLabResults(extractedText);
            }
        } catch (geminiError) {
            console.log('Gemini analysis failed, falling back to basic parsing:', geminiError);
            labResults = parseLabResults(extractedText);
            analysisMethod = 'basic_fallback';
        }

        if (labResults.length === 0) {
            return res.status(200).json({
                message: 'No lab parameters found in the uploaded file.',
                extractedText: extractedText.substring(0, 500) + '...',
                results: [],
                analysisMethod,
                insights: 'Unable to extract any lab parameters from this document.'
            });
        }

        console.log(`Parsed ${labResults.length} lab results using ${analysisMethod}:`, labResults);

        return res.status(200).json({
            message: `Successfully extracted ${labResults.length} lab parameters using ${analysisMethod === 'gemini' ? 'AI analysis' : 'basic parsing'}`,
            results: labResults,
            extractedText: extractedText.substring(0, 500) + '...',
            analysisMethod,
            insights
        });

    } catch (error) {
        console.error('OCR processing error:', error);
        return res.status(500).json({
            error: 'Failed to process the uploaded file. Please try again.'
        });
    }
} 