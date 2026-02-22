import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, AccountCircle, Lock } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, BOX_SHADOWS } from '../constants/colors';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { state, login, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.user) {
      navigate('/dashboard');
    }
  }, [state.user, navigate]);

useEffect(() => {
  return () => {
    clearError();
  };
}, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      await login(username, password);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: COLORS.gradients.primary,
        py: 4,
        px: 2,
      }}
    >
      <Paper 
        elevation={0} 
        sx={{ 
          padding: { xs: 3, sm: 5 }, 
          width: '100%',
          maxWidth: '500px',
          borderRadius: 4,
          boxShadow: BOX_SHADOWS.card,
          background: COLORS.background.paper,
        }}
      >
        {/* Logo/Brand Section */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography 
                component="h1" 
                variant="h3" 
                sx={{ 
                  fontWeight: 800,
                  background: COLORS.gradients.income,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                }}
              >
                Mindoh
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: COLORS.text.tertiary,
                  fontWeight: 500,
                }}
              >
                Your personal expense tracker
              </Typography>
            </Box>

            <Typography 
              component="h2" 
              variant="h5" 
              align="center" 
              sx={{ 
                mb: 3,
                fontWeight: 700,
                color: COLORS.text.primary,
              }}
            >
              Welcome Back
            </Typography>
            
            {state.error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                }}
              >
                {state.error}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={state.loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircle sx={{ color: COLORS.text.tertiary }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: COLORS.income.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: COLORS.income.main,
                    },
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={state.loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: COLORS.text.tertiary }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: COLORS.income.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: COLORS.income.main,
                    },
                  },
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  mt: 4, 
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  background: COLORS.gradients.income,
                  boxShadow: BOX_SHADOWS.income,
                  '&:hover': {
                    background: COLORS.gradients.income,
                    boxShadow: BOX_SHADOWS.incomeHover,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
                disabled={state.loading}
              >
                {state.loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>
              <Box textAlign="center" mt={2}>
                <Typography variant="body2" sx={{ color: COLORS.text.tertiary }}>
                  Don't have an account?{' '}
                  <Link 
                    to="/register" 
                    style={{ 
                      textDecoration: 'none',
                      color: COLORS.income.main,
                      fontWeight: 600,
                    }}
                  >
                    Sign Up
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
    </Box>
  );
};

export default Login;
