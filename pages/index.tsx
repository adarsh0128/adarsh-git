import React, { useState } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import {
    Container,
    Typography,
    Box,
    AppBar,
    Toolbar,
    CssBaseline,
    ThemeProvider,
    createTheme,
    Alert,
    Snackbar,
    Paper,
    Chip,
    Divider
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { SmartToy, InfoOutlined } from '@mui/icons-material';
import UploadDropzone from '../components/UploadDropzone';
import ResultsTable from '../components/ResultsTable';
import TrendChart from '../components/TrendChart';
import { LabResult } from '../lib/parser';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
        background: {
            default: '#f5f5f5',
        },
    },
    typography: {
        h4: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
    },
});

interface HomeProps {
    // Add any static props if needed
}

const Home: React.FC<HomeProps> = () => {
    const [results, setResults] = useState<LabResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [selectedTrendParameter, setSelectedTrendParameter] = useState<string>('');
    const [insights, setInsights] = useState<string>('');
    const [analysisMethod, setAnalysisMethod] = useState<string>('');

    const handleFileUpload = async (file: File) => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/ocr', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to process file');
            }

            setResults(data.results || []);
            setInsights(data.insights || '');
            setAnalysisMethod(data.analysisMethod || 'basic');

            if (data.results && data.results.length > 0) {
                setSuccess(`Successfully extracted ${data.results.length} lab parameters using ${data.analysisMethod === 'gemini' ? 'AI analysis' : 'basic parsing'}!`);
                // Set default trend parameter
                const trendableParams = data.results.filter((r: LabResult) =>
                    ['Hemoglobin', 'Glucose', 'Cholesterol', 'White Blood Cell Count'].includes(r.parameter)
                );
                if (trendableParams.length > 0) {
                    setSelectedTrendParameter(trendableParams[0].parameter);
                }
            } else {
                setSuccess('File processed, but no recognizable lab parameters were found.');
            }

        } catch (err) {
            console.error('Upload error:', err);
            setError(err instanceof Error ? err.message : 'An error occurred while processing the file');
        } finally {
            setLoading(false);
        }
    };

    const handleTrendParameterChange = (parameter: string) => {
        setSelectedTrendParameter(parameter);
    };

    const handleCloseSnackbar = () => {
        setError(null);
        setSuccess(null);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Head>
                <title>Lab Report Extractor</title>
                <meta name="description" content="Extract and analyze lab report parameters using OCR" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <AppBar position="static" elevation={2}>
                <Toolbar>
                    <LocalHospitalIcon sx={{ mr: 2 }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Lab Report Extractor
                    </Typography>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Extract Health Parameters from Lab Reports
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                        Upload your lab report (PDF or image) and instantly see extracted health parameters
                        in an interactive table with trend analysis.
                    </Typography>
                </Box>

                <UploadDropzone
                    onFileSelect={handleFileUpload}
                    loading={loading}
                    error={error}
                />

                {results.length > 0 && (
                    <>
                        {/* Analysis Method Indicator */}
                        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                                icon={analysisMethod === 'gemini' ? <SmartToy /> : <InfoOutlined />}
                                label={analysisMethod === 'gemini' ? 'AI Enhanced Analysis' : 'Basic Pattern Matching'}
                                color={analysisMethod === 'gemini' ? 'primary' : 'default'}
                                variant={analysisMethod === 'gemini' ? 'filled' : 'outlined'}
                                size="small"
                            />
                            {analysisMethod === 'gemini' && (
                                <Typography variant="caption" color="text.secondary">
                                    Powered by Gemini 1.5 Flash
                                </Typography>
                            )}
                        </Box>

                        <ResultsTable results={results} />

                        {/* AI Insights Section */}
                        {insights && analysisMethod === 'gemini' && (
                            <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8f9ff' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <SmartToy color="primary" sx={{ mr: 1 }} />
                                    <Typography variant="h6" color="primary">
                                        AI Health Insights
                                    </Typography>
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                                    {insights}
                                </Typography>
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    <Typography variant="caption">
                                        <strong>Disclaimer:</strong> These insights are for informational purposes only and should not replace professional medical advice.
                                        Always consult with your healthcare provider for proper interpretation of lab results.
                                    </Typography>
                                </Alert>
                            </Paper>
                        )}

                        <TrendChart
                            results={results}
                            selectedParameter={selectedTrendParameter}
                            onParameterChange={handleTrendParameterChange}
                        />
                    </>
                )}

                {results.length === 0 && !loading && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Ready to analyze your lab report
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Upload a file to get started with automatic parameter extraction
                        </Typography>
                    </Box>
                )}

                {/* Success/Error Snackbars */}
                <Snackbar
                    open={!!success}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                        {success}
                    </Alert>
                </Snackbar>

                <Snackbar
                    open={!!error}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                        {error}
                    </Alert>
                </Snackbar>
            </Container>

            {/* Footer */}
            <Box
                component="footer"
                sx={{
                    py: 3,
                    px: 2,
                    mt: 'auto',
                    backgroundColor: theme.palette.grey[200],
                }}
            >
                <Container maxWidth="lg">
                    <Typography variant="body2" color="text.secondary" align="center">
                        Lab Report Extractor - Extract health parameters from medical reports using OCR & AI
                    </Typography>
                    <Typography variant="caption" color="text.secondary" align="center" display="block">
                        Powered by Gemini 1.5 Flash, Tesseract.js, Material-UI, and Next.js
                    </Typography>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    return {
        props: {},
    };
};

export default Home; 