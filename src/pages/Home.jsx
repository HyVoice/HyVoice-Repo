import React from 'react';
import Dashboard from '../components/Dashboard';
import { Container, Typography, Box } from '@mui/material';

const Home = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          HyVoice Dashboard
        </Typography>
        <Typography variant="h6" color="textSecondary" align="center" paragraph>
          Track and monitor civic grievances across Hyderabad
        </Typography>
        
        <Dashboard />
      </Box>
    </Container>
  );
};

export default Home;