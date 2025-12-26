import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Alert,
  Divider,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  Fade
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup 
} from 'firebase/auth';
import { auth } from '../firebase/config';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SecurityIcon from '@mui/icons-material/Security';

const Login = ({ user }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Auto-fill demo credentials
  const [autoFillDemo, setAutoFillDemo] = useState(false);

  // If user is already logged in, show different UI
  useEffect(() => {
    if (user) {
      setSuccess(`Already logged in as ${user.email}`);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        await signInWithEmailAndPassword(auth, email, password);
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => navigate('/'), 1500);
      } else {
        // Signup
        await createUserWithEmailAndPassword(auth, email, password);
        setSuccess('Account created successfully! Redirecting...');
        setTimeout(() => navigate('/'), 1500);
      }
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setSuccess('Google login successful! Redirecting...');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(getErrorMessage(err.code));
    }
  };

  const getErrorMessage = (code) => {
    switch (code) {
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/user-disabled':
        return 'Account disabled';
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/email-already-in-use':
        return 'Email already in use';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/too-many-requests':
        return 'Too many attempts. Try again later';
      case 'auth/network-request-failed':
        return 'Network error. Check your connection';
      case 'auth/popup-closed-by-user':
        return 'Google sign-in was cancelled';
      default:
        return 'Authentication failed. Please try again.';
    }
  };

  // Demo account login
  const handleDemoLogin = (role = 'user') => {
    let demoEmail = '';
    let demoPassword = '';
    
    switch(role) {
      case 'admin':
        demoEmail = 'admin@hyvoice.com';
        demoPassword = 'admin123';
        break;
      case 'municipal':
        demoEmail = 'worker@ghmc.gov.in';
        demoPassword = 'ghmc123';
        break;
      case 'user':
      default:
        demoEmail = 'user@hyvoice.com';
        demoPassword = 'user123';
        break;
    }
    
    setEmail(demoEmail);
    setPassword(demoPassword);
    setAutoFillDemo(true);
    
    // Auto-submit after a brief delay
    setTimeout(() => {
      if (document.querySelector('form')) {
        document.querySelector('form').dispatchEvent(new Event('submit'));
      }
    }, 500);
  };

  // If user is already logged in, show this UI
  if (user) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          py: 4 
        }}>
          <Fade in={true}>
            <Paper elevation={3} sx={{ 
              p: 4, 
              width: '100%', 
              borderRadius: 3,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)'
            }}>
              <Box sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                bgcolor: '#4caf50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3
              }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                Welcome Back! 👋
              </Typography>
              
              <Alert severity="success" sx={{ mb: 3 }}>
                You are already logged in as <strong>{user.email}</strong>
              </Alert>
              
              <Card sx={{ mb: 3, border: '1px solid #c8e6c9' }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Account Details
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: 2,
                    mb: 2
                  }}>
                    <Box sx={{ 
                      width: 50, 
                      height: 50, 
                      borderRadius: '50%', 
                      bgcolor: '#1976d2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1.2rem',
                      fontWeight: 'bold'
                    }}>
                      {user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                    </Box>
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="body1" fontWeight="medium">
                        {user.displayName || 'HyVoice User'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {user.email?.includes('admin') && (
                    <Alert severity="info" icon={<SecurityIcon />} sx={{ mt: 2 }}>
                      Administrator Account
                    </Alert>
                  )}
                  
                  {user.email?.includes('ghmc') && (
                    <Alert severity="info" icon={<SecurityIcon />} sx={{ mt: 2 }}>
                      GHMC Municipal Staff Account
                    </Alert>
                  )}
                </CardContent>
              </Card>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
                <Button
                  variant="contained"
                  component={Link}
                  to="/"
                  fullWidth
                  size="large"
                  startIcon={<DashboardIcon />}
                  sx={{ py: 1.5 }}
                >
                  Go to Dashboard
                </Button>
                
                <Button
                  variant="outlined"
                  component={Link}
                  to="/report"
                  fullWidth
                  size="large"
                  startIcon={<PersonAddIcon />}
                  sx={{ py: 1.5 }}
                >
                  Report New Issue
                </Button>
                
                <Divider sx={{ my: 1 }}>or</Divider>
                
                <Button
                  variant="outlined"
                  color="error"
                  component={Link}
                  to="/logout"
                  fullWidth
                  size="large"
                  startIcon={<LogoutIcon />}
                  sx={{ py: 1.5 }}
                >
                  Logout & Switch Account
                </Button>
              </Box>
              
              <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 3 }}>
                Need to use a different account? Logout first.
              </Typography>
            </Paper>
          </Fade>
        </Box>
      </Container>
    );
  }

  // Regular login/signup UI
  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        py: 4 
      }}>
        <Fade in={true}>
          <Paper elevation={3} sx={{ 
            p: { xs: 3, md: 4 }, 
            width: '100%', 
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #1976d2, #4caf50)'
            }
          }}>
            {/* Logo and Title */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{ 
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: '#1976d2',
                color: 'white',
                mb: 2
              }}>
                <SecurityIcon sx={{ fontSize: 30 }} />
              </Box>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                HyVoice
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Hyderabad Civic Grievance Portal
              </Typography>
              <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 1 }}>
                {isLogin ? 'Login to access your dashboard' : 'Create your HyVoice account'}
              </Typography>
            </Box>

            {/* Demo Accounts Section */}
            <Card sx={{ mb: 3, border: '1px solid #e0e0e0', bgcolor: '#f8f9fa' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: '#666' }}>
                  🚀 Quick Demo Login (For Hackathon)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleDemoLogin('user')}
                    sx={{ 
                      borderColor: '#4caf50', 
                      color: '#4caf50',
                      '&:hover': { bgcolor: '#e8f5e9' }
                    }}
                  >
                    👤 Regular User
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleDemoLogin('municipal')}
                    sx={{ 
                      borderColor: '#ff9800', 
                      color: '#ff9800',
                      '&:hover': { bgcolor: '#fff3e0' }
                    }}
                  >
                    🏛️ Municipal Staff
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleDemoLogin('admin')}
                    sx={{ 
                      borderColor: '#1976d2', 
                      color: '#1976d2',
                      '&:hover': { bgcolor: '#e3f2fd' }
                    }}
                  >
                    🔧 Administrator
                  </Button>
                </Box>
                {autoFillDemo && (
                  <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                    Demo credentials auto-filled. Submitting...
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Success/Error Messages */}
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Google Sign In */}
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignIn}
              sx={{ 
                mb: 3, 
                py: 1.2,
                borderColor: '#ddd',
                '&:hover': { 
                  borderColor: '#1976d2',
                  bgcolor: '#f5f5f5'
                }
              }}
            >
              Continue with Google
            </Button>

            <Divider sx={{ mb: 3 }}>
              <Typography variant="body2" color="textSecondary">OR</Typography>
            </Divider>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />

              {isLogin && (
                <Box sx={{ textAlign: 'right', mt: 1, mb: 2 }}>
                  <Typography 
                    variant="body2" 
                    component={Link} 
                    to="/forgot-password"
                    sx={{ 
                      color: '#1976d2', 
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    Forgot password?
                  </Typography>
                </Box>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ 
                  mt: 2, 
                  mb: 2, 
                  py: 1.3,
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  background: 'linear-gradient(90deg, #1976d2, #2196f3)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #1565c0, #1976d2)',
                  }
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 20, 
                      height: 20, 
                      border: '2px solid rgba(255,255,255,0.3)', 
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' }
                      }
                    }} />
                    Processing...
                  </Box>
                ) : (
                  isLogin ? 'Login to HyVoice' : 'Create Account'
                )}
              </Button>
            </form>

            {/* Toggle Login/Signup */}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="textSecondary">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <Typography
                  component="span"
                  variant="body2"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setSuccess('');
                  }}
                  sx={{ 
                    color: '#1976d2', 
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    ml: 0.5,
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  {isLogin ? 'Sign Up' : 'Login'}
                </Typography>
              </Typography>
            </Box>

            {/* Security Notice */}
            <Alert severity="info" sx={{ mt: 4, fontSize: '0.875rem' }}>
              <Typography variant="caption">
                🔒 Your data is secured with Firebase Authentication. 
                {isLogin ? ' Login to access your civic dashboard.' : ' Create account to start reporting issues.'}
              </Typography>
            </Alert>

            {/* Terms and Privacy */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary">
                By continuing, you agree to HyVoice's <br />
                <Link to="/terms" style={{ color: '#1976d2', textDecoration: 'none' }}>Terms of Service</Link> and{' '}
                <Link to="/privacy" style={{ color: '#1976d2', textDecoration: 'none' }}>Privacy Policy</Link>
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Box>
    </Container>
  );
};

export default Login;