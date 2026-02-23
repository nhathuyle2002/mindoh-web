import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import { authService } from '../services/authService';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }
    authService.verifyEmail(token)
      .then(() => {
        setStatus('success');
        setMessage('Your email has been verified! You can now sign in.');
      })
      .catch((err: unknown) => {
        const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
        setStatus('error');
        setMessage(msg ?? 'Invalid or expired verification link.');
      });
  }, [token]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f4f6f9', px: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 420 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
          <Box component="img" src="/favicon.svg" alt="logo" sx={{ width: 40, height: 40 }} />
          <Typography variant="h5" fontWeight={800} sx={{ color: '#1a202c' }}>Mindoh</Typography>
        </Box>

        <Typography variant="h4" fontWeight={800} sx={{ color: '#1a202c', mb: 3 }}>Email Verification</Typography>

        {status === 'loading' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={24} sx={{ color: '#28C76F' }} />
            <Typography color="text.secondary">Verifying your email…</Typography>
          </Box>
        )}

        {status === 'success' && (
          <>
            <Alert severity="success" sx={{ borderRadius: 2, mb: 2 }}>{message}</Alert>
            <Typography variant="body2">
              <Link to="/login" style={{ color: '#28C76F', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
            </Typography>
          </>
        )}

        {status === 'error' && (
          <>
            <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>{message}</Alert>
            <Typography variant="body2" color="text.secondary">
              Need a new link?{' '}
              <Link to="/login" style={{ color: '#28C76F', fontWeight: 600, textDecoration: 'none' }}>Go to sign in</Link>
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
};

export default VerifyEmail;
