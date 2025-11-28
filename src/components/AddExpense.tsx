import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  MenuItem,
  CircularProgress,
  Autocomplete,
  IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { expenseService } from '../services/expenseService';
import type { ExpenseRequest } from '../types/api';
import { CURRENCIES } from '../constants/currencies';
import { EXPENSE_KINDS } from '../constants/expense';
import { COLORS, BOX_SHADOWS } from '../constants/colors';

interface AddExpenseProps {
  onExpenseAdded?: () => void;
  onClose?: () => void;
}

const AddExpense: React.FC<AddExpenseProps> = ({ onExpenseAdded, onClose }) => {
  // Get user from localStorage
  const getUserId = () => {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const parsed = JSON.parse(user);
        return parsed.id || 0;
      }
    } catch {
      // ignore
    }
    return 0;
  };

  const [formData, setFormData] = useState<ExpenseRequest>({
    user_id: getUserId(),
    amount: 0,
    description: '',
    kind: 'expense',
    type: '',
    currency: 'VND',
    date: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);

  // Update user_id if localStorage changes (e.g., login/logout)
  useEffect(() => {
    setFormData(prev => ({ ...prev, user_id: getUserId() }));
    // Fetch available types
    expenseService.getUniqueTypes().then(types => setAvailableTypes(types)).catch(() => {});
    // eslint-disable-next-line
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await expenseService.createExpense({ 
        ...formData, 
        user_id: getUserId(), 
        type: formData.type.trim(),
        date: new Date(formData.date).toISOString() 
      });
      setSuccess(true);
      setFormData({
        user_id: getUserId(),
        amount: 0,
        description: '',
        kind: 'expense',
        type: '',
        currency: 'VND',
        date: new Date().toISOString(),
      });
      if (onExpenseAdded) {
        onExpenseAdded();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ExpenseRequest, value: string | number | Date) => {
    if (field === 'date' && value instanceof Date) {
      setFormData(prev => ({
        ...prev,
        date: value.toISOString(),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={0} sx={{ 
        p: 4, 
        position: 'relative',
        borderRadius: 3,
        background: COLORS.background.paper,
        boxShadow: BOX_SHADOWS.card,
      }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: COLORS.text.tertiary,
            '&:hover': {
              bgcolor: COLORS.background.hover,
              color: COLORS.text.primary,
            },
          }}
        >
          <Close />
        </IconButton>
        <Typography variant="h5" gutterBottom fontWeight={600} mb={3} sx={{ color: COLORS.text.primary }}>
          Add New Transaction
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} variant="filled">{error}</Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} variant="filled">Transaction added successfully!</Alert>
        )}
        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                sx={{ flex: '1 1 200px' }}
                label="Amount"
                type="number"
                value={formData.amount || ''}
                onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                required
                inputProps={{ min: 0, step: 0.01 }}
                disabled={loading}
              />
              <TextField
                sx={{ flex: '1 1 150px' }}
                select
                label="Currency"
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                required
                disabled={loading}
              >
                {CURRENCIES.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                sx={{ flex: '1 1 150px' }}
                select
                label="Kind"
                value={formData.kind}
                onChange={(e) => handleChange('kind', e.target.value)}
                required
                disabled={loading}
              >
                {EXPENSE_KINDS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
              <Autocomplete
                sx={{ flex: '1 1 200px' }}
                freeSolo
                options={availableTypes}
                value={formData.type}
                onChange={(_, newValue) => handleChange('type', newValue || '')}
                onInputChange={(_, newInputValue) => handleChange('type', newInputValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Type"
                    placeholder="Select or type new"
                    required
                    disabled={loading}
                  />
                )}
                disabled={loading}
              />
            </Box>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              required
              multiline
              rows={3}
              disabled={loading}
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date"
                value={formData.date ? new Date(formData.date) : new Date()}
                onChange={(date) => {
                  if (date) {
                    handleChange('date', date);
                  }
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    disabled: loading,
                  },
                }}
              />
            </LocalizationProvider>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              size="large"
              sx={{ 
                mt: 1,
                background: COLORS.gradients.income,
                color: COLORS.text.primary,
                fontWeight: 600,
                boxShadow: BOX_SHADOWS.income,
                '&:hover': {
                  boxShadow: BOX_SHADOWS.incomeHover,
                },
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Add Transaction'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddExpense;
