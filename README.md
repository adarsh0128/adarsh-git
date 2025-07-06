# Lab Report Extractor

# Lab Report Extractor

A production-ready web application that extracts health parameters from lab reports using OCR technology and AI-powered analysis. Upload PDF or image files and instantly see extracted health parameters in an interactive table with trend analysis and intelligent health insights.

## Features

- **File Upload**: Drag & drop or click to upload PDF, PNG, JPEG, GIF, and BMP files
- **AI-Enhanced Analysis**: Uses Gemini 1.5 Flash for intelligent parameter extraction and health insights
- **OCR Processing**: Extracts text from uploaded files using Tesseract.js
- **Smart Parameter Parsing**: AI-powered identification and parsing of lab parameters including:
  - Hemoglobin
  - White Blood Cell Count
  - Red Blood Cell Count
  - Platelet Count
  - Glucose
  - Cholesterol (Total, HDL, LDL)
  - Triglycerides
  - Creatinine
  - Blood Urea Nitrogen
  - ALT/AST (Liver enzymes)
- **Interactive Results Table**: Sortable/filterable DataGrid with status indicators
- **AI Health Insights**: Intelligent analysis and recommendations for abnormal values
- **Trend Charts**: Historical trend visualization for key parameters
- **Status Flagging**: Automatic flagging of values outside normal ranges
- **Dual Analysis Modes**: AI-enhanced analysis with Gemini or basic pattern matching fallback
- **Responsive Design**: Modern UI built with Material-UI

## Tech Stack

- **Frontend**: Next.js (React), Material-UI, Recharts
- **Backend**: Next.js API routes (Node.js)
- **AI Analysis**: Google Gemini 1.5 Flash API
- **OCR**: Tesseract.js
- **File Upload**: Formidable
- **PDF Processing**: pdf-parse
- **Charts**: Recharts
- **Styling**: Material-UI with custom theme

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd lab-report-app
```

2. Install dependencies:

```bash
npm install
```

3. **Set up Gemini API (Recommended)**:

   - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create `.env.local` file in the project root:

   ```bash
   GEMINI_API_KEY=your_actual_api_key_here
   ```

   - See `env-setup.md` for detailed setup instructions
   - Without API key, the app will use basic pattern matching

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Upload a Lab Report**:

   - Drag and drop a PDF or image file onto the upload area
   - Or click "Choose File" to browse and select a file
   - Supported formats: PDF, PNG, JPEG, GIF, BMP (max 10MB)

2. **View Results**:

   - Extracted parameters appear in an interactive table
   - Parameters outside normal ranges are highlighted
   - Analysis method indicator shows "AI Enhanced" or "Basic Pattern Matching"
   - AI-generated health insights provide context for abnormal values (when API key configured)
   - Use the table controls to sort and filter results

3. **Analyze Trends**:
   - View historical trends for key parameters
   - Select different parameters from the dropdown
   - Reference lines show normal ranges

## Project Structure

```
lab-report-app/
├── components/
│   ├── UploadDropzone.tsx    # File upload with drag & drop
│   ├── ResultsTable.tsx      # Interactive results table
│   └── TrendChart.tsx        # Historical trend charts
├── lib/
│   ├── ocr.ts               # OCR processing utilities
│   └── parser.ts            # Text parsing and parameter extraction
├── pages/
│   ├── api/
│   │   └── ocr.ts          # OCR API endpoint
│   ├── _document.tsx       # Custom document for Material-UI
│   └── index.tsx           # Main application page
├── data/
│   └── dummy-reports.json  # Sample historical data
└── public/                 # Static assets
```

## API Endpoints

### POST /api/ocr

Processes uploaded lab report files and extracts health parameters.

**Request:**

- Method: POST
- Content-Type: multipart/form-data
- Body: file (PDF or image)

**Response:**

```json
{
  "message": "Successfully extracted X lab parameters",
  "results": [
    {
      "parameter": "Hemoglobin",
      "value": "14.2",
      "unit": "g/dL",
      "range": { "low": 12.0, "high": 16.0 },
      "status": "Normal"
    }
  ],
  "extractedText": "..."
}
```

## Security Features

- File type validation (only allows PDF and image formats)
- File size limits (max 10MB)
- Server-side processing with no client-side secrets
- Input sanitization and validation
- CORS protection

## Supported Lab Parameters

The application can recognize and parse the following parameters:

- **Blood Count**: Hemoglobin, WBC, RBC, Platelets
- **Metabolic Panel**: Glucose, Creatinine, BUN
- **Lipid Panel**: Total Cholesterol, HDL, LDL, Triglycerides
- **Liver Function**: ALT, AST
- **Additional**: Custom parameters with numeric values and units

## Normal Reference Ranges

Reference ranges are built-in for common parameters:

- Hemoglobin: 12.0-16.0 g/dL
- WBC: 4,000-11,000 cells/μL
- Glucose: 70-100 mg/dL
- Total Cholesterol: <200 mg/dL
- And more...

## Development

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Limitations

- OCR accuracy depends on image/PDF quality
- Currently supports English text only
- Parameter detection based on common naming patterns
- Reference ranges are generalized (not personalized)

## Future Enhancements

- User authentication with NextAuth.js
- Database integration for historical data
- ✅ ~~AI-powered insights and recommendations~~ (Implemented with Gemini)
- Multi-language support
- Custom reference ranges
- Report history and comparison
- Export functionality
- Voice-to-text for report dictation
- Advanced trend analysis with predictive insights

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue in the repository.
