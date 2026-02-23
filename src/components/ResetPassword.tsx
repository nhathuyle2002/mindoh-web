import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Box, TextField, Button, Typography, Alert, CircularProgress,
  InputAdornment, IconButton,
} from '@mui/material';
import { Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { authService } from '../services/authService';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
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
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (!token) { setError('Invalid reset link'); return; }

    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setDone(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? 'Invalid or expired reset link.');
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

        <Typography variant="h4" fontWeight={800} sx={{ color: '#1a202c', mb: 0.5 }}>Set new password</Typography>
        <Typography variant="body2" sx={{ color: '#718096', mb: 4 }}>
          Choose a strong password for your account.
        </Typography>

        {done ? (
          <>
            <Alert severity="success" sx={{ borderRadius: 2, mb: 2 }}>
              Your password has been reset successfully.
            </Alert>
            <Typography variant="body2" align="center">
              <Link to="/login" style={{ textDecoration: 'none', color: '#28C76F', fontWeight: 600 }}>Sign in with new password</Link>
            </Typography>
          </>
        ) : (
          <>
            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                margin="normal" required fullWidth label="New password"
                type={showPassword ? 'text' : 'password'}
                value={password} onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#a0aec0', fontSize: 20 }} /></InputAdornment>,
                  endAdornment: <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>,
                }}
                sx={fieldSx}
              />
              <TextField
                margin="normal" required fullWidth label="Confirm password"
                type={showPassword ? 'text' : 'password'}
                value={confirm} onChange={(e) => setConfirm(e.target.value)}
                disabled={loading}
                InputProps={{ startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#a0aec0', fontSize: 20 }} /></InputAdornment> }}
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
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset password'}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default ResetPassword;
