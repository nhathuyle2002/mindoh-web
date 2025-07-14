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
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { expenseService } from '../services/expenseService';
import type { ExpenseRequest, ExpenseKind, ExpenseType } from '../types/api';

const kinds: ExpenseKind[] = ['expense', 'income'];
const types: ExpenseType[] = ['food', 'salary', 'transport', 'entertainment', 'other'];
const currencies = ['USD', 'EUR', 'VND'];

interface AddExpenseProps {
  onExpenseAdded?: () => void;
}

const AddExpense: React.FC<AddExpenseProps> = ({ onExpenseAdded }) => {
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
    type: 'food',
    currency: 'USD',
    date: new Date().toISOString(), // Default to ISO string with time
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Update user_id if localStorage changes (e.g., login/logout)
  useEffect(() => {
    setFormData(prev => ({ ...prev, user_id: getUserId() }));
    // eslint-disable-next-line
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await expenseService.createExpense({ ...formData, user_id: getUserId(), date: new Date(formData.date).toISOString() });
      setSuccess(true);
      setFormData({
        user_id: getUserId(),
        amount: 0,
        description: '',
        kind: 'expense',
        type: 'food',
        currency: 'USD',
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
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Add New Expense
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>Expense added successfully!</Alert>
        )}
        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={formData.amount || ''}
                onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                required
                inputProps={{ min: 0, step: 0.01 }}
                disabled={loading}
              />
              <TextField
                fullWidth
                select
                label="Kind"
                value={formData.kind}
                onChange={(e) => handleChange('kind', e.target.value)}
                required
                disabled={loading}
              >
                {kinds.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                select
                label="Type"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                required
                disabled={loading}
              >
                {types.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                select
                label="Currency"
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                required
                disabled={loading}
              >
                {currencies.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
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
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Add Expense'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddExpense;
