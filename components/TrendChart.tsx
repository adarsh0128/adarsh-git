import React from 'react';
import {
    Box,
    Typography,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { LabResult, generateDummyHistoricalData } from '../lib/parser';

interface TrendChartProps {
    results: LabResult[];
    selectedParameter?: string;
    onParameterChange: (parameter: string) => void;
}

const TrendChart: React.FC<TrendChartProps> = ({
    results,
    selectedParameter,
    onParameterChange
}) => {
    const handleParameterChange = (event: SelectChangeEvent) => {
        onParameterChange(event.target.value);
    };

    const availableParameters = results.filter(result =>
        ['Hemoglobin', 'Glucose', 'Cholesterol', 'White Blood Cell Count'].includes(result.parameter)
    );

    if (availableParameters.length === 0) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                    No trend data available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Upload a lab report with common parameters (Hemoglobin, Glucose, Cholesterol, WBC) to see trends
                </Typography>
            </Paper>
        );
    }

    const currentParameter = selectedParameter || availableParameters[0].parameter;
    const currentResult = results.find(r => r.parameter === currentParameter);
    const historicalData = generateDummyHistoricalData(currentParameter);

    // Add current result as the latest data point
    if (currentResult) {
        const today = new Date().toISOString().split('T')[0];
        historicalData.push({
            date: today,
            value: parseFloat(currentResult.value)
        });
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatTooltipDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <Box sx={{
                    backgroundColor: 'white',
                    p: 2,
                    border: '1px solid #ccc',
                    borderRadius: 1,
                    boxShadow: 2
                }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatTooltipDate(label)}
                    </Typography>
                    <Typography variant="body2" color="primary">
                        {`Value: ${payload[0].value} ${currentResult?.unit || ''}`}
                    </Typography>
                </Box>
            );
        }
        return null;
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" component="h2">
                    Parameter Trends
                </Typography>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Select Parameter</InputLabel>
                    <Select
                        value={currentParameter}
                        label="Select Parameter"
                        onChange={handleParameterChange}
                    >
                        {availableParameters.map((result) => (
                            <MenuItem key={result.parameter} value={result.parameter}>
                                {result.parameter}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <LineChart data={historicalData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatDate}
                            stroke="#666"
                        />
                        <YAxis
                            stroke="#666"
                            domain={['dataMin - 10', 'dataMax + 10']}
                        />
                        <Tooltip content={<CustomTooltip />} />

                        {/* Reference lines for normal range */}
                        {currentResult && (
                            <>
                                <ReferenceLine
                                    y={currentResult.range.high}
                                    stroke="#ff9800"
                                    strokeDasharray="5 5"
                                    label={{ value: "High", position: "right" }}
                                />
                                <ReferenceLine
                                    y={currentResult.range.low}
                                    stroke="#ff9800"
                                    strokeDasharray="5 5"
                                    label={{ value: "Low", position: "right" }}
                                />
                            </>
                        )}

                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#1976d2"
                            strokeWidth={3}
                            dot={{ fill: '#1976d2', strokeWidth: 2, r: 5 }}
                            activeDot={{ r: 7, fill: '#1976d2' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Box>

            <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    Historical trend (last 6 months) + current value
                </Typography>
                {currentResult && (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Box sx={{
                            width: 12,
                            height: 2,
                            backgroundColor: '#ff9800',
                            borderRadius: 1
                        }} />
                        <Typography variant="caption" color="text.secondary">
                            Normal Range: {currentResult.range.low} - {currentResult.range.high} {currentResult.unit}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Paper>
    );
};

export default TrendChart; 