import React, { useState } from 'react';
import { auth } from '../firebase/config';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup 
} from 'firebase/auth';
import { Button, TextField, Box, Typography } from '@mui/material';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleEmailAuth = async () => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      alert(`${isLogin ? 'Logged in' : 'Signed up'} successfully!`);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      alert('Logged in with Google!');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4, p: 3, border: '1px solid #ccc' }}>
      <Typography variant="h5" gutterBottom>
        {isLogin ? 'Login' : 'Sign Up'} to HyVoice
      </Typography>
      
      <TextField
        fullWidth
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        margin="normal"
      />
      
      <TextField
        fullWidth
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        margin="normal"
      />
      
      <Button 
        fullWidth 
        variant="contained" 
        onClick={handleEmailAuth}
        sx={{ mt: 2 }}
      >
        {isLogin ? 'Login' : 'Sign Up'}
      </Button>
      
      <Button 
        fullWidth 
        variant="outlined" 
        onClick={handleGoogleAuth}
        sx={{ mt: 1 }}
      >
        Sign in with Google
      </Button>
      
      <Button 
        fullWidth 
        onClick={() => setIsLogin(!isLogin)}
        sx={{ mt: 1 }}
      >
        {isLogin ? 'Need an account? Sign up' : 'Already have account? Login'}
      </Button>
    </Box>
  );
};

export default Auth;