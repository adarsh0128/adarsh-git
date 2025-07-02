import { createWorker } from 'tesseract.js';
import * as pdfParse from 'pdf-parse';

export interface OCROptions {
    language?: string;
    psm?: number;
}

export async function extractTextFromImage(
    imageBuffer: Buffer,
    options: OCROptions = {}
): Promise<string> {
    const worker = await createWorker('eng');

    try {
        const { data: { text } } = await worker.recognize(imageBuffer, {
            logger: m => console.log(m)
        });

        return text;
    } finally {
        await worker.terminate();
    }
}

export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
    try {
        const data = await pdfParse(pdfBuffer);
        return data.text;
    } catch (error) {
        console.error('PDF parsing error:', error);
        throw new Error('Failed to extract text from PDF');
    }
}

export async function extractTextFromFile(
    buffer: Buffer,
    mimeType: string
): Promise<string> {
    if (mimeType === 'application/pdf') {
        return extractTextFromPDF(buffer);
    } else if (mimeType.startsWith('image/')) {
        return extractTextFromImage(buffer);
    } else {
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
} 