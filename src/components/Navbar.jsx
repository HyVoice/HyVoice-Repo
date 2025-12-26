import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Avatar, 
  Menu, 
  MenuItem, 
  IconButton,
  Divider,
  Badge,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth'; // Import signOut directly from Firebase
import { auth } from '../firebase/config';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';

const Navbar = ({ user, isAdmin, isMunicipal }) => {
  const [userAuth] = useAuthState(auth);
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [logoutError, setLogoutError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const currentUser = user || userAuth;
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenu = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchor(null);
  };

  const handleLogout = async () => {
    try {
      console.log('Attempting logout...');
      await signOut(auth); // Use Firebase signOut directly
      console.log('Logout successful');
      
      // Clear any local storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Force navigation to login page
      window.location.href = '/login'; // Use window.location for hard redirect
    } catch (error) {
      console.error('Logout error:', error);
      setLogoutError(error.message);
      
      // Even if there's an error, redirect to login
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    }
  };

  const handleQuickLogout = () => {
    // Quick logout without confirmation
    signOut(auth).then(() => {
      window.location.href = '/login';
    }).catch(error => {
      console.error('Quick logout error:', error);
      window.location.href = '/login';
    });
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <AppBar position="static" sx={{ 
        bgcolor: '#1976d2',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <Toolbar sx={{ minHeight: '70px' }}>
          {/* Mobile Menu Button */}
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMobileMenu}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
            <ReportProblemIcon sx={{ mr: 1.5, fontSize: 28 }} />
            <Typography 
              variant="h6" 
              component={Link} 
              to="/"
              sx={{ 
                color: 'white', 
                textDecoration: 'none',
                fontWeight: 'bold',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              HyVoice
            </Typography>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                color: 'rgba(255,255,255,0.8)',
                ml: 1,
                display: { xs: 'none', md: 'block' }
              }}
            >
              Hyderabad Civic Portal
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          <Box sx={{ 
            flexGrow: 1, 
            display: { xs: 'none', sm: 'flex' }, 
            alignItems: 'center',
            gap: 1 
          }}>
            <Button 
              color="inherit" 
              component={Link} 
              to="/"
              startIcon={<HomeIcon />}
              sx={{ 
                bgcolor: isActive('/') ? 'rgba(255,255,255,0.15)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Dashboard
            </Button>
            
            <Button 
              color="inherit" 
              component={Link} 
              to="/report"
              startIcon={<AddCircleIcon />}
              sx={{ 
                bgcolor: isActive('/report') ? 'rgba(255,255,255,0.15)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Report Issue
            </Button>
            
            {/* Admin/Municipal Links */}
            {(isAdmin || isMunicipal) && (
              <>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/admin"
                  startIcon={<AdminPanelSettingsIcon />}
                  sx={{ 
                    bgcolor: isActive('/admin') ? 'rgba(255,255,255,0.15)' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Manage
                  {isMunicipal && !isAdmin && (
                    <Chip 
                      label="GHMC" 
                      size="small" 
                      sx={{ 
                        ml: 1, 
                        height: 20, 
                        fontSize: '0.65rem',
                        bgcolor: '#4caf50',
                        color: 'white'
                      }} 
                    />
                  )}
                </Button>
              </>
            )}
          </Box>

          {/* Right Side - User Section */}
          {currentUser ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Quick Logout Button (Visible on desktop) */}
              <Button
                color="inherit"
                onClick={handleQuickLogout}
                startIcon={<LogoutIcon />}
                sx={{ 
                  display: { xs: 'none', sm: 'flex' },
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Logout
              </Button>
              
              {/* User Avatar & Menu */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar
                  onClick={handleMenu}
                  sx={{ 
                    width: 40, 
                    height: 40, 
                    cursor: 'pointer',
                    bgcolor: currentUser.photoURL ? 'transparent' : '#fff',
                    color: currentUser.photoURL ? 'inherit' : '#1976d2',
                    border: '2px solid rgba(255,255,255,0.3)'
                  }}
                  src={currentUser.photoURL}
                >
                  {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0).toUpperCase()}
                </Avatar>
                
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 'medium' }}>
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {isAdmin ? 'Administrator' : isMunicipal ? 'Municipal Staff' : 'Citizen'}
                  </Typography>
                </Box>
              </Box>
              
              {/* Desktop User Menu */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                PaperProps={{
                  sx: { 
                    mt: 1.5,
                    minWidth: 200,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <MenuItem disabled sx={{ opacity: 1, py: 1.5 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {currentUser.displayName || currentUser.email}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {currentUser.email}
                    </Typography>
                    {(isAdmin || isMunicipal) && (
                      <Chip 
                        label={isAdmin ? 'Administrator' : 'GHMC Staff'} 
                        size="small" 
                        sx={{ 
                          mt: 1, 
                          height: 20, 
                          fontSize: '0.65rem',
                          bgcolor: isAdmin ? '#1976d2' : '#4caf50',
                          color: 'white'
                        }} 
                      />
                    )}
                  </Box>
                </MenuItem>
                
                <Divider />
                
                <MenuItem component={Link} to="/" onClick={handleClose}>
                  <DashboardIcon fontSize="small" sx={{ mr: 2 }} />
                  Dashboard
                </MenuItem>
                
                <MenuItem component={Link} to="/report" onClick={handleClose}>
                  <AddCircleIcon fontSize="small" sx={{ mr: 2 }} />
                  Report Issue
                </MenuItem>
                
                {(isAdmin || isMunicipal) && (
                  <MenuItem component={Link} to="/admin" onClick={handleClose}>
                    <AdminPanelSettingsIcon fontSize="small" sx={{ mr: 2 }} />
                    Manage Grievances
                  </MenuItem>
                )}
                
                <Divider />
                
                <MenuItem onClick={handleLogout} sx={{ color: '#d32f2f' }}>
                  <LogoutIcon fontSize="small" sx={{ mr: 2 }} />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Button 
              color="inherit" 
              component={Link} 
              to="/login"
              variant="outlined"
              startIcon={<AccountCircleIcon />}
              sx={{ 
                borderColor: 'white', 
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Login
            </Button>
          )}

          {/* Mobile Menu */}
          <Menu
            anchorEl={mobileMenuAnchor}
            open={Boolean(mobileMenuAnchor)}
            onClose={handleClose}
            sx={{ display: { sm: 'none' } }}
          >
            <MenuItem component={Link} to="/" onClick={handleClose}>
              <HomeIcon fontSize="small" sx={{ mr: 2 }} />
              Dashboard
            </MenuItem>
            
            <MenuItem component={Link} to="/report" onClick={handleClose}>
              <AddCircleIcon fontSize="small" sx={{ mr: 2 }} />
              Report Issue
            </MenuItem>
            
            {(isAdmin || isMunicipal) && (
              <MenuItem component={Link} to="/admin" onClick={handleClose}>
                <AdminPanelSettingsIcon fontSize="small" sx={{ mr: 2 }} />
                Manage
              </MenuItem>
            )}
            
            {currentUser ? (
              <>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: '#d32f2f' }}>
                  <LogoutIcon fontSize="small" sx={{ mr: 2 }} />
                  Logout
                </MenuItem>
              </>
            ) : (
              <MenuItem component={Link} to="/login" onClick={handleClose}>
                <AccountCircleIcon fontSize="small" sx={{ mr: 2 }} />
                Login
              </MenuItem>
            )}
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Logout Error Snackbar */}
      <Snackbar 
        open={!!logoutError} 
        autoHideDuration={6000} 
        onClose={() => setLogoutError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setLogoutError(null)}>
          Logout failed: {logoutError}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Navbar;