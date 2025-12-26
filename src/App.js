import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress, Typography } from '@mui/material';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Report from './pages/Report';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/Admin';
import AnalyticsDashboard from './components/AnalyticsDashboard'; // Optional analytics
import Logout from './pages/Logout';
import ProtectedRoute from './components/ProtectedRoute';
import { auth } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

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
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
});

// Admin check function
const isAdminUser = (user) => {
  if (!user || !user.email) return false;
  return user.email.toLowerCase().includes('admin') || 
         user.email.toLowerCase().endsWith('@hyvoice.com');
};

// Municipal worker check
const isMunicipalWorker = (user) => {
  if (!user || !user.email) return false;
  return user.email.toLowerCase().endsWith('@ghmc.gov.in') ||
         user.email.toLowerCase().endsWith('@hyderabad.gov.in');
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMunicipal, setIsMunicipal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAdmin(isAdminUser(user));
      setIsMunicipal(isMunicipalWorker(user));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2,
        bgcolor: '#f5f5f5'
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="primary">
          Loading HyVoice...
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Hyderabad Civic Grievance Portal
        </Typography>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/logout" element={<Logout />} />
          {/* Protected Routes - Accessible to all authenticated users */}
          <Route path="/" element={
            <ProtectedRoute>
              <>
                <Navbar user={user} isAdmin={isAdmin} isMunicipal={isMunicipal} />
                <Home user={user} />
              </>
            </ProtectedRoute>
          } />
          
          <Route path="/report" element={
            <ProtectedRoute>
              <>
                <Navbar user={user} isAdmin={isAdmin} isMunicipal={isMunicipal} />
                <Report user={user} />
              </>
            </ProtectedRoute>
          } />
          
          {/* Admin Routes - Only accessible to admin users */}
          <Route path="/admin" element={
            <ProtectedRoute>
              {isAdmin || isMunicipal ? (
                <>
                  <Navbar user={user} isAdmin={isAdmin} isMunicipal={isMunicipal} />
                  <AdminDashboard user={user} />
                </>
              ) : (
                <Navigate to="/" replace />
              )}
            </ProtectedRoute>
          } />
          
          {/* Analytics Route (Optional) */}
          <Route path="/analytics" element={
            <ProtectedRoute>
              {isAdmin || isMunicipal ? (
                <>
                  <Navbar user={user} isAdmin={isAdmin} isMunicipal={isMunicipal} />
                  <AnalyticsDashboard />
                </>
              ) : (
                <Navigate to="/" replace />
              )}
            </ProtectedRoute>
          } />
          
          {/* Redirect all other routes */}
          <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;