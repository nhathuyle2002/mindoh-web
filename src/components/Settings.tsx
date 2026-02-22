import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Avatar,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Settings: React.FC = () => {
  const { state, updateUser, clearError } = useAuth();
  const user = state.user;

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [birthdate, setBirthdate] = useState(user?.birthdate || '');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    return () => { clearError(); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    const ok = await updateUser({ name, email, phone, address, birthdate });
    if (ok) setSuccess(true);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 600 }}>
      <Typography variant="h5" fontWeight={700} mb={3} color="#1a202c">
        Settings
      </Typography>

      <Paper elevation={0} sx={{ border: '1px solid #e9ecef', borderRadius: 3, p: 3 }}>
        {/* Avatar header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar sx={{ bgcolor: '#28C76F', width: 56, height: 56, fontSize: '1.4rem', fontWeight: 700 }}>
            {(user?.name || user?.username || '?')[0].toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={600} color="#1a202c">
              {user?.name || user?.username}
            </Typography>
            <Typography variant="caption" color="#718096">
              @{user?.username}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {state.error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
            {state.error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(false)}>
            Profile updated successfully.
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            disabled={state.loading}
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            disabled={state.loading}
          />
          <TextField
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
            disabled={state.loading}
          />
          <TextField
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            fullWidth
            multiline
            rows={2}
            disabled={state.loading}
          />
          <TextField
            label="Birthdate"
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            fullWidth
            disabled={state.loading}
            InputLabelProps={{ shrink: true }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={state.loading}
              sx={{ bgcolor: '#28C76F', '&:hover': { bgcolor: '#22a85f' }, px: 4 }}
            >
              {state.loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Settings;
