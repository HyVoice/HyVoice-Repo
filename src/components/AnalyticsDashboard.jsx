import React, { useState, useEffect } from 'react';
import { 
  Box, Paper, Typography, Grid, Card, CardContent,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [categoryData, setCategoryData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  
  // Mock data for demo - replace with actual Firestore queries
  const categoryColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
  
  useEffect(() => {
    // Fetch and process analytics data
    loadAnalyticsData();
  }, [timeRange]);
  
  const loadAnalyticsData = async () => {
    // Implement actual Firestore queries here
    // For now, using mock data
    
    setCategoryData([
      { name: 'Pothole', value: 45 },
      { name: 'Street Light', value: 30 },
      { name: 'Garbage', value: 25 },
      { name: 'Water', value: 15 },
      { name: 'Drainage', value: 20 },
      { name: 'Other', value: 10 }
    ]);
    
    setStatusData([
      { name: 'Submitted', value: 25 },
      { name: 'Acknowledged', value: 30 },
      { name: 'In Progress', value: 20 },
      { name: 'Resolved', value: 15 },
      { name: 'Rejected', value: 5 },
      { name: 'Duplicate', value: 5 }
    ]);
    
    setTrendData([
      { date: 'Jan', issues: 40, resolved: 15 },
      { date: 'Feb', issues: 45, resolved: 20 },
      { date: 'Mar', issues: 50, resolved: 25 },
      { date: 'Apr', issues: 55, resolved: 30 },
      { date: 'May', issues: 60, resolved: 35 },
      { date: 'Jun', issues: 65, resolved: 40 }
    ]);
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Analytics Dashboard</Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Time Range"
          >
            <MenuItem value="week">Last Week</MenuItem>
            <MenuItem value="month">Last Month</MenuItem>
            <MenuItem value="quarter">Last Quarter</MenuItem>
            <MenuItem value="year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Issues by Category</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Status Distribution</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Trend Analysis</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="issues" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="resolved" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard;