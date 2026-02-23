import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Avatar,
  Chip,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Person,
  Lock,
  Email,
  Phone,
  Home,
  Cake,
  Visibility,
  VisibilityOff,
  Edit,
  AdminPanelSettings,
  CheckCircle,
  ErrorOutline,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { COLORS, BOX_SHADOWS } from '../constants/colors';

const AVATAR_COLORS = [
  '#28C76F', '#4F9CFE', '#EA5455', '#FF9F43',
  '#9C27B0', '#00BCD4', '#FF5722', '#607D8B',
];

const avatarColor = (name?: string) =>
  AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

// ── Section header ─────────────────────────────────────────────────────────────
const SectionHeader = ({ icon, title, subtitle }: {
  icon: React.ReactNode; title: string; subtitle?: string;
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
    <Box sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: 36, height: 36, borderRadius: 2,
      bgcolor: COLORS.background.hover,
      color: COLORS.income.main,
    }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="subtitle1" fontWeight={700} sx={{ color: COLORS.text.primary, lineHeight: 1.2 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" sx={{ color: COLORS.text.quaternary }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  </Box>
);

const Settings: React.FC = () => {
  const { state, updateUser, updateEmail, clearError } = useAuth();
  const user = state.user;

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [birthdate, setBirthdate] = useState(user?.birthdate || '');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Change email
  const [newEmail, setNewEmail] = useState('');
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Password change fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Email verification
  const [verifyResendLoading, setVerifyResendLoading] = useState(false);
  const [verifyResendSuccess, setVerifyResendSuccess] = useState(false);
  const [verifyResendError, setVerifyResendError] = useState<string | null>(null);

  useEffect(() => {
    return () => { clearError(); };
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(false);
    const ok = await updateUser({ name, phone, address, birthdate });
    if (ok) setProfileSuccess(true);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(false);
    if (!newEmail) return;
    try {
      setEmailLoading(true);
      const ok = await updateEmail(newEmail);
      if (ok) {
        setEmailSuccess(true);
        setNewEmail('');
      }
    } catch {
      setEmailError('Failed to update email. Please try again.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!user?.email) return;
    setVerifyResendLoading(true);
    setVerifyResendSuccess(false);
    setVerifyResendError(null);
    try {
      await authService.resendVerification(user.email);
      setVerifyResendSuccess(true);
    } catch {
      setVerifyResendError('Failed to send verification email. Please try again.');
    } finally {
      setVerifyResendLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    try {
      setPasswordLoading(true);
      await authService.changePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setPasswordError(msg || 'Failed to change password. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const displayName = user?.name || user?.username || '?';
  const initials = displayName.slice(0, 2).toUpperCase();
  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: COLORS.background.main }}>
      <Container maxWidth="sm" sx={{ pt: { xs: 2, md: 4 }, pb: 6, px: { xs: 2, sm: 3 } }}>

        {/* ── Profile card ─────────────────────────────────────── */}
        <Paper sx={{
          p: 3, mb: 3, borderRadius: 3, boxShadow: BOX_SHADOWS.card,
          background: COLORS.gradients.primary,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Avatar sx={{
              bgcolor: avatarColor(displayName),
              width: 64, height: 64,
              fontSize: '1.5rem', fontWeight: 700,
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            }}>
              {initials}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" fontWeight={700} sx={{ color: COLORS.text.primary, lineHeight: 1.2 }}>
                {displayName}
              </Typography>
              <Typography variant="body2" sx={{ color: COLORS.text.tertiary, mb: 0.75 }}>
                @{user?.username}
                {joinDate && ` · Joined ${joinDate}`}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {user?.role && (
                  <Chip
                    icon={<AdminPanelSettings sx={{ fontSize: '0.85rem !important' }} />}
                    label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '0.72rem' }}
                  />
                )}
                {user?.email && (
                  <Chip
                    icon={<Email sx={{ fontSize: '0.85rem !important' }} />}
                    label={user.email}
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.7)', fontWeight: 500, fontSize: '0.72rem', maxWidth: 220 }}
                  />
                )}
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* ── Email Verification ────────────────────────────────── */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: BOX_SHADOWS.card }}>
          <SectionHeader
            icon={<Email fontSize="small" />}
            title="Email Verification"
            subtitle="Verify your email address to unlock all features"
          />
          <Divider sx={{ mb: 3 }} />
          {user?.is_email_verified ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CheckCircle sx={{ color: '#28C76F', fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: COLORS.text.secondary }}>
                <strong>{user.email}</strong> is verified.
              </Typography>
              <Chip
                label="Verified"
                size="small"
                sx={{ bgcolor: 'rgba(40,199,111,0.12)', color: '#28C76F', fontWeight: 700, fontSize: '0.72rem' }}
              />
            </Box>
          ) : (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ErrorOutline sx={{ color: '#FF9F43', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: COLORS.text.secondary }}>
                  <strong>{user?.email}</strong> is not yet verified.
                </Typography>
                <Chip
                  label="Not verified"
                  size="small"
                  sx={{ bgcolor: 'rgba(255,159,67,0.12)', color: '#FF9F43', fontWeight: 700, fontSize: '0.72rem' }}
                />
              </Box>
              {verifyResendError && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setVerifyResendError(null)}>
                  {verifyResendError}
                </Alert>
              )}
              {verifyResendSuccess && (
                <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setVerifyResendSuccess(false)}>
                  Verification email sent! Check your inbox.
                </Alert>
              )}
              <Button
                variant="outlined"
                size="small"
                disabled={verifyResendLoading}
                startIcon={verifyResendLoading ? undefined : <Email fontSize="small" />}
                onClick={handleResendVerification}
                sx={{
                  borderColor: '#FF9F43',
                  color: '#FF9F43',
                  '&:hover': { borderColor: '#e8872e', bgcolor: 'rgba(255,159,67,0.06)' },
                  borderRadius: 2,
                }}
              >
                {verifyResendLoading ? <CircularProgress size={18} sx={{ color: '#FF9F43' }} /> : 'Resend verification email'}
              </Button>
            </Box>
          )}
        </Paper>

        {/* ── Profile info ─────────────────────────────────────── */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: BOX_SHADOWS.card }}>
          <SectionHeader
            icon={<Person fontSize="small" />}
            title="Profile Information"
            subtitle="Update your personal details"
          />
          <Divider sx={{ mb: 3 }} />

          {state.error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>{state.error}</Alert>
          )}
          {profileSuccess && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setProfileSuccess(false)}>
              Profile updated successfully.
            </Alert>
          )}

          <Box component="form" onSubmit={handleProfileSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth size="small"
              disabled={state.loading}
              InputProps={{ startAdornment: <InputAdornment position="start"><Person fontSize="small" sx={{ color: COLORS.text.quaternary }} /></InputAdornment> }}
            />
            <TextField
              label="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              fullWidth size="small"
              disabled={state.loading}
              InputProps={{ startAdornment: <InputAdornment position="start"><Phone fontSize="small" sx={{ color: COLORS.text.quaternary }} /></InputAdornment> }}
            />
            <TextField
              label="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              fullWidth size="small"
              multiline rows={2}
              disabled={state.loading}
              InputProps={{ startAdornment: <InputAdornment position="start"><Home fontSize="small" sx={{ color: COLORS.text.quaternary, mt: '2px', alignSelf: 'flex-start' }} /></InputAdornment> }}
            />
            <TextField
              label="Birthdate"
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              fullWidth size="small"
              disabled={state.loading}
              InputLabelProps={{ shrink: true }}
              InputProps={{ startAdornment: <InputAdornment position="start"><Cake fontSize="small" sx={{ color: COLORS.text.quaternary }} /></InputAdornment> }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={state.loading}
                startIcon={state.loading ? undefined : <Edit fontSize="small" />}
                sx={{
                  bgcolor: COLORS.income.main,
                  '&:hover': { bgcolor: COLORS.income.dark },
                  borderRadius: 2, px: 3,
                }}
              >
                {state.loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* ── Change Email ─────────────────────────────────────── */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: BOX_SHADOWS.card }}>
          <SectionHeader
            icon={<Email fontSize="small" />}
            title="Change Email"
            subtitle="Enter a new email address — you will need to verify it again"
          />
          <Divider sx={{ mb: 3 }} />
          {emailError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setEmailError(null)}>{emailError}</Alert>
          )}
          {emailSuccess && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setEmailSuccess(false)}>
              Email updated! A verification link has been sent to your new address.
            </Alert>
          )}
          <Box component="form" onSubmit={handleEmailSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="New Email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              fullWidth size="small"
              required
              placeholder={user?.email || ''}
              disabled={emailLoading}
              InputProps={{ startAdornment: <InputAdornment position="start"><Email fontSize="small" sx={{ color: COLORS.text.quaternary }} /></InputAdornment> }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
              <Button
                type="submit"
                variant="outlined"
                disabled={emailLoading || !newEmail}
                startIcon={emailLoading ? undefined : <Email fontSize="small" />}
                sx={{
                  borderColor: COLORS.income.main,
                  color: COLORS.income.main,
                  '&:hover': { borderColor: COLORS.income.dark, bgcolor: COLORS.background.hover },
                  borderRadius: 2, px: 3,
                }}
              >
                {emailLoading ? <CircularProgress size={20} sx={{ color: COLORS.income.main }} /> : 'Update Email'}
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* ── Change password ───────────────────────────────────── */}
        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: BOX_SHADOWS.card }}>
          <SectionHeader
            icon={<Lock fontSize="small" />}
            title="Change Password"
            subtitle="Update your account password"
          />
          <Divider sx={{ mb: 3 }} />

          {passwordError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPasswordError(null)}>{passwordError}</Alert>
          )}
          {passwordSuccess && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setPasswordSuccess(false)}>
              Password changed successfully.
            </Alert>
          )}

          <Box component="form" onSubmit={handlePasswordSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Current Password"
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              fullWidth size="small"
              required
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock fontSize="small" sx={{ color: COLORS.text.quaternary }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowCurrent(v => !v)} edge="end">
                      {showCurrent ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="New Password"
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth size="small"
              required
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock fontSize="small" sx={{ color: COLORS.text.quaternary }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowNew(v => !v)} edge="end">
                      {showNew ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirm New Password"
              type={showNew ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth size="small"
              required
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock fontSize="small" sx={{ color: COLORS.text.quaternary }} /></InputAdornment>,
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
              <Button
                type="submit"
                variant="outlined"
                disabled={passwordLoading}
                startIcon={passwordLoading ? undefined : <Lock fontSize="small" />}
                sx={{
                  borderColor: COLORS.income.main,
                  color: COLORS.income.main,
                  '&:hover': { borderColor: COLORS.income.dark, bgcolor: COLORS.background.hover },
                  borderRadius: 2, px: 3,
                }}
              >
                {passwordLoading ? <CircularProgress size={20} sx={{ color: COLORS.income.main }} /> : 'Update Password'}
              </Button>
            </Box>
          </Box>
        </Paper>

      </Container>
    </Box>
  );
};

export default Settings;
