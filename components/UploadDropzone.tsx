import React, { useCallback, useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    LinearProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface UploadDropzoneProps {
    onFileSelect: (file: File) => void;
    loading?: boolean;
    error?: string;
    accept?: string;
}

const UploadDropzone: React.FC<UploadDropzoneProps> = ({
    onFileSelect,
    loading = false,
    error,
    accept = '.pdf,.png,.jpg,.jpeg,.gif,.bmp'
}) => {
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            handleFileSelect(file);
        }
    }, []);

    const handleFileSelect = (file: File) => {
        // Validate file type
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/bmp'
        ];

        if (!allowedTypes.includes(file.type)) {
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            return;
        }

        onFileSelect(file);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    return (
        <Box sx={{ width: '100%', mb: 3 }}>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Paper
                sx={{
                    p: 4,
                    textAlign: 'center',
                    border: `2px dashed ${dragActive ? '#1976d2' : '#ccc'}`,
                    backgroundColor: dragActive ? '#f5f5f5' : 'transparent',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        backgroundColor: loading ? 'transparent' : '#f9f9f9',
                        borderColor: loading ? '#ccc' : '#1976d2'
                    }
                }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    id="file-upload"
                    accept={accept}
                    onChange={handleFileInput}
                    style={{ display: 'none' }}
                    disabled={loading}
                />

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {loading ? (
                        <>
                            <CircularProgress size={48} sx={{ mb: 2 }} />
                            <Typography variant="h6" color="primary" gutterBottom>
                                Processing your file...
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Extracting text and analyzing lab parameters
                            </Typography>
                            <LinearProgress sx={{ width: '100%', mt: 2 }} />
                        </>
                    ) : (
                        <>
                            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Upload Lab Report
                            </Typography>
                            <Typography variant="body1" color="text.secondary" gutterBottom>
                                Drag and drop your lab report here, or click to browse
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Supported formats: PDF, PNG, JPEG, GIF, BMP (max 10MB)
                            </Typography>
                            <Button
                                variant="contained"
                                component="label"
                                htmlFor="file-upload"
                                sx={{ mt: 1 }}
                            >
                                Choose File
                            </Button>
                        </>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default UploadDropzone; 