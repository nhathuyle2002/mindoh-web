import React, { useState } from 'react';
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
import type { ExpenseRequest } from '../types/api';

interface AddExpenseProps {
  onExpenseAdded?: () => void;
}

const categories = [
  'Food',
  'Transport',
  'Entertainment',
  'Utilities',
  'Healthcare',
  'Shopping',
  'Education',
  'Other',
];

const AddExpense: React.FC<AddExpenseProps> = ({ onExpenseAdded }) => {
  const [formData, setFormData] = useState<ExpenseRequest>({
    amount: 0,
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await expenseService.createExpense(formData);
      setSuccess(true);
      setFormData({
        amount: 0,
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
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

  const handleChange = (field: keyof ExpenseRequest, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
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
                label="Category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                required
                disabled={loading}
              >
                {categories.map((option) => (
                  <MenuItem key={option} value={option.toLowerCase()}>
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
                value={new Date(formData.date)}
                onChange={(date) => {
                  if (date) {
                    handleChange('date', date.toISOString().split('T')[0]);
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
