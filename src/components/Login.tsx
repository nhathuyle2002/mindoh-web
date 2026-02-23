import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
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

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { state, login, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.user) {
      navigate('/summary');
    }
  }, [state.user, navigate]);

  useEffect(() => {
    return () => {
      clearError();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
  };

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2, bgcolor: '#fff',
      '&:hover fieldset': { borderColor: '#28C76F' },
      '&.Mui-focused fieldset': { borderColor: '#28C76F' },
    },
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left branding panel */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' }, flexDirection: 'column',
        justifyContent: 'center', alignItems: 'flex-start',
        width: '45%', px: 8, py: 6,
        background: 'linear-gradient(160deg, #1e2d50 0%, #090912 100%)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 5 }}>
          <Box component="img" src="/favicon.svg" alt="logo" sx={{ width: 52, height: 52 }} />
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#a3ffcb', letterSpacing: 0.5 }}>Mindoh</Typography>
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 800, color: '#ffffff', mb: 2, lineHeight: 1.2 }}>
          Track smarter,<br />spend better.
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(163,255,203,0.65)', mb: 5, lineHeight: 1.8, maxWidth: 380 }}>
          Your all-in-one personal finance tracker. Monitor income, expenses, and balance across multiple currencies.
        </Typography>
        {['\u{1F4CA} Visual summaries with charts', '\u{1F4B1} Multi-currency support', '\u{1F50D} Powerful filters & grouping'].map(f => (
          <Typography key={f} variant="body2" sx={{ color: 'rgba(255,255,255,0.55)', mb: 1.2, fontWeight: 500 }}>{f}</Typography>
        ))}
      </Box>

      {/* Right form panel */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f6f9', px: { xs: 3, sm: 8 } }}>
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 4 }}>
            <Box component="img" src="/favicon.svg" alt="logo" sx={{ width: 40, height: 40 }} />
            <Typography variant="h5" fontWeight={800} sx={{ color: '#1a202c' }}>Mindoh</Typography>
          </Box>
          <Typography variant="h4" fontWeight={800} sx={{ color: '#1a202c', mb: 0.5 }}>Welcome back</Typography>
          <Typography variant="body2" sx={{ color: '#718096', mb: 4 }}>Sign in to your account to continue</Typography>

          {state.error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{state.error}</Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal" required fullWidth label="Username"
              autoComplete="username" autoFocus
              value={username} onChange={(e) => setUsername(e.target.value)}
              disabled={state.loading}
              InputProps={{ startAdornment: <InputAdornment position="start"><AccountCircle sx={{ color: '#a0aec0', fontSize: 20 }} /></InputAdornment> }}
              sx={fieldSx}
            />
            <TextField
              margin="normal" required fullWidth label="Password"
              type={showPassword ? 'text' : 'password'} autoComplete="current-password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              disabled={state.loading}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#a0aec0', fontSize: 20 }} /></InputAdornment>,
                endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">{showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}</IconButton></InputAdornment>,
              }}
              sx={fieldSx}
            />
            <Button type="submit" fullWidth variant="contained" disabled={state.loading}
              sx={{
                mt: 3, mb: 2, py: 1.4, borderRadius: 2, fontWeight: 700, fontSize: '1rem',
                background: 'linear-gradient(135deg, #43e97b 0%, #28C76F 100%)',
                boxShadow: '0 4px 20px rgba(40,199,111,0.35)',
                '&:hover': { background: 'linear-gradient(135deg, #43e97b 0%, #1ea55a 100%)', boxShadow: '0 6px 24px rgba(40,199,111,0.45)', transform: 'translateY(-1px)' },
                transition: 'all 0.25s ease',
              }}>
              {state.loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: '#718096' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ textDecoration: 'none', color: '#28C76F', fontWeight: 600 }}>Sign Up</Link>
              </Typography>
              <Link to="/forgot-password" style={{ textDecoration: 'none', color: '#718096', fontSize: '0.875rem' }}>
                Forgot password?
              </Link>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
