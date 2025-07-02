import React from 'react';
import {
    Box,
    Typography,
    Chip,
    Paper
} from '@mui/material';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { LabResult } from '../lib/parser';

interface ResultsTableProps {
    results: LabResult[];
    title?: string;
}

const ResultsTable: React.FC<ResultsTableProps> = ({
    results,
    title = "Lab Results"
}) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'High':
                return 'error';
            case 'Low':
                return 'warning';
            case 'Normal':
                return 'success';
            case 'Needs Attention':
                return 'error';
            default:
                return 'default';
        }
    };

    const columns: GridColDef[] = [
        {
            field: 'parameter',
            headerName: 'Parameter',
            width: 250,
            flex: 1,
            renderCell: (params) => (
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'value',
            headerName: 'Value',
            width: 120,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'unit',
            headerName: 'Unit',
            width: 100,
            align: 'center',
            headerAlign: 'center'
        },
        {
            field: 'referenceRange',
            headerName: 'Reference Range',
            width: 150,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const row = params.row as LabResult;
                return (
                    <Typography variant="body2" color="text.secondary">
                        {row.range.low} - {row.range.high}
                    </Typography>
                );
            }
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 140,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color={getStatusColor(params.value) as any}
                    size="small"
                    variant="filled"
                />
            )
        }
    ];

    const rows = results.map((result, index) => ({
        id: index,
        ...result,
        referenceRange: `${result.range.low} - ${result.range.high}`
    }));

    const getRowClassName = (params: GridRowParams) => {
        const status = params.row.status;
        if (status === 'High' || status === 'Low' || status === 'Needs Attention') {
            return 'abnormal-row';
        }
        return '';
    };

    if (results.length === 0) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                    No lab results to display
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Upload a lab report to see extracted parameters here
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2">
                    {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {results.length} parameters found
                </Typography>
            </Box>

            <Box sx={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10]}
                    disableSelectionOnClick
                    getRowClassName={getRowClassName}
                    sx={{
                        '& .abnormal-row': {
                            backgroundColor: '#fff3e0',
                            '&:hover': {
                                backgroundColor: '#ffe0b2',
                            },
                        },
                        '& .MuiDataGrid-cell': {
                            borderBottom: '1px solid #f0f0f0',
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: '#f5f5f5',
                            fontWeight: 600,
                        },
                    }}
                />
            </Box>

            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="body2" color="text.secondary">
                    Status Legend:
                </Typography>
                <Chip label="Normal" color="success" size="small" />
                <Chip label="High" color="error" size="small" />
                <Chip label="Low" color="warning" size="small" />
                <Chip label="Needs Attention" color="error" size="small" />
            </Box>
        </Paper>
    );
};

export default ResultsTable; 