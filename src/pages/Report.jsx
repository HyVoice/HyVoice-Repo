import React, { useState } from 'react';
import { Container, Typography, Box, Grid, Paper, Alert } from '@mui/material';
import RealTimeMap from '../components/RealTimeMap';
import ReportForm from '../components/ReportForm';

const Report = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Report Civic Issue - Hyderabad
        </Typography>
        <Typography variant="h6" color="textSecondary" align="center" paragraph>
          Use the interactive map to pinpoint exact issue location
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
              <RealTimeMap onLocationSelect={setSelectedLocation} />
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={5}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" gutterBottom sx={{ color: '#1976d2' }}>
                Report Details
              </Typography>
              
              {selectedLocation ? (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Location selected! Fill the form below.
                </Alert>
              ) : (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Please select a location on the map first
                </Alert>
              )}
              
              <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Selected Location:
                </Typography>
                {selectedLocation ? (
                  <>
                    <Typography variant="body2">
                      {selectedLocation.address}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Coordinates: {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No location selected yet
                  </Typography>
                )}
              </Box>
              
              <ReportForm location={selectedLocation} />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Report;