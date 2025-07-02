# Environment Setup for Lab Report Extractor

## Gemini API Integration

To enable AI-powered lab report analysis with Gemini 1.5 Flash, you need to set up your API key:

### 1. Get Your Gemini API Key
- Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
- Create a new API key for your project
- Copy the generated API key

### 2. Configure Environment Variables
Create a `.env.local` file in the root of your project (`lab-report-app/.env.local`) with:

```bash
# Google Gemini API Key for AI-powered lab report analysis
GEMINI_API_KEY=your_actual_api_key_here

# Optional: Set to 'development' for more verbose logging
NODE_ENV=production
```

### 3. Features Enabled with Gemini API
When `GEMINI_API_KEY` is configured, the app will:
- Use Gemini 1.5 Flash for intelligent parameter extraction
- Provide AI-generated health insights
- Better handle various lab report formats
- Show "AI Enhanced Analysis" badge

### 4. Fallback Behavior
If no API key is provided, the app will:
- Fall back to basic OCR + regex parsing
- Show "Basic Pattern Matching" mode
- Still extract common parameters but with limited accuracy

### 5. Security Notes
- Never commit your `.env.local` file to version control
- Keep your API key secure and don't share it publicly
- The API key is only used on the server side (Next.js API routes)

## Testing
After setting up the API key, restart your development server:
```bash
npm run dev
```

Upload a lab report to test the AI-enhanced analysis! 