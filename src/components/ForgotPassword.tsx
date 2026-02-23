import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, TextField, Button, Typography, Alert, CircularProgress,
} from '@mui/material';
import { Email, ErrorOutline } from '@mui/icons-material';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

const ForgotPassword: React.FC = () => {
  const { state } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2, bgcolor: '#fff',
      '&:hover fieldset': { borderColor: '#28C76F' },
      '&.Mui-focused fieldset': { borderColor: '#28C76F' },
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f4f6f9', px: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 420 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
          <Box component="img" src="/favicon.svg" alt="logo" sx={{ width: 40, height: 40 }} />
          <Typography variant="h5" fontWeight={800} sx={{ color: '#1a202c' }}>Mindoh</Typography>
        </Box>

        <Typography variant="h4" fontWeight={800} sx={{ color: '#1a202c', mb: 0.5 }}>Forgot password?</Typography>
        <Typography variant="body2" sx={{ color: '#718096', mb: 4 }}>
          Enter your email and we'll send you a reset link.
        </Typography>

        {state.user && !state.user.is_email_verified ? (
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <ErrorOutline sx={{ fontSize: 48, color: '#FF9F43' }} />
            </Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#1a202c', mb: 1 }}>
              Email not verified
            </Typography>
            <Typography variant="body2" sx={{ color: '#718096', mb: 3 }}>
              You must verify your email address before you can reset your password. Check your inbox or resend the verification email from your settings.
            </Typography>
            <Button
              component={Link}
              to="/settings"
              variant="contained"
              sx={{
                mb: 2, py: 1.2, borderRadius: 2, fontWeight: 700,
                background: 'linear-gradient(135deg, #43e97b 0%, #28C76F 100%)',
                boxShadow: '0 4px 20px rgba(40,199,111,0.35)',
                '&:hover': { background: 'linear-gradient(135deg, #43e97b 0%, #1ea55a 100%)' },
              }}
            >
              Go to Settings to verify
            </Button>
          </Box>
        ) : sent ? (
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            Check your inbox — a reset link has been sent to <strong>{email}</strong>.
          </Alert>
        ) : (
          <>
            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                margin="normal" required fullWidth label="Email address" type="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                InputProps={{ startAdornment: <Email sx={{ color: '#a0aec0', fontSize: 20, mr: 1 }} /> }}
                sx={fieldSx}
              />
              <Button
                type="submit" fullWidth variant="contained" disabled={loading}
                sx={{
                  mt: 3, mb: 2, py: 1.4, borderRadius: 2, fontWeight: 700, fontSize: '1rem',
                  background: 'linear-gradient(135deg, #43e97b 0%, #28C76F 100%)',
                  boxShadow: '0 4px 20px rgba(40,199,111,0.35)',
                  '&:hover': { background: 'linear-gradient(135deg, #43e97b 0%, #1ea55a 100%)' },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Send reset link'}
              </Button>
            </Box>
          </>
        )}

        <Typography variant="body2" align="center" sx={{ color: '#718096', mt: 2 }}>
          <Link to="/login" style={{ textDecoration: 'none', color: '#28C76F', fontWeight: 600 }}>Back to sign in</Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default ForgotPassword;
