import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Button,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import HomeIcon from '@mui/icons-material/Home';

const Logout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    performLogout();
  }, []);

  const performLogout = async () => {
    try {
      console.log('Starting logout process...');
      
      // Sign out from Firebase
      await signOut(auth);
      
      // Clear all local storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      console.log('Logout successful');
      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
      
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message);
      
      // Still redirect to login even on error
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const manualRedirect = () => {
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        p: 3,
        bgcolor: '#f5f5f5'
      }}>
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h5" gutterBottom>
          Logging out...
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Please wait while we sign you out
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      p: 3,
      bgcolor: '#f5f5f5'
    }}>
      <Card sx={{ maxWidth: 500, width: '100%', textAlign: 'center' }}>
        <CardContent sx={{ p: 4 }}>
          {success ? (
            <>
              <Box sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                bgcolor: '#e8f5e9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3
              }}>
                <LogoutIcon sx={{ fontSize: 40, color: '#4caf50' }} />
              </Box>
              
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                Successfully Logged Out
              </Typography>
              
              <Typography variant="body1" color="textSecondary" paragraph>
                You have been successfully signed out of your HyVoice account.
              </Typography>
              
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Redirecting to login page...
              </Typography>
              
              <CircularProgress size={24} sx={{ mb: 2 }} />
            </>
          ) : error ? (
            <>
              <Box sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                bgcolor: '#ffebee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3
              }}>
                <LogoutIcon sx={{ fontSize: 40, color: '#f44336' }} />
              </Box>
              
              <Alert severity="error" sx={{ mb: 3 }}>
                Logout Error: {error}
              </Alert>
              
              <Typography variant="body1" color="textSecondary" paragraph>
                There was an issue signing you out automatically.
              </Typography>
              
              <Button
                variant="contained"
                fullWidth
                startIcon={<LoginIcon />}
                onClick={manualRedirect}
                sx={{ mt: 2, mb: 1 }}
              >
                Go to Login Page
              </Button>
              
              <Button
                variant="outlined"
                fullWidth
                startIcon={<HomeIcon />}
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
            </>
          ) : null}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Logout;