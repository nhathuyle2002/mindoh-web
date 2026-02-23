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
import type { ExpenseRequest, Expense } from '../types/api';
import { CURRENCIES } from '../constants/currencies';
import { EXPENSE_KINDS, EXPENSE_RESOURCES } from '../constants/expense';
import { COLORS, BOX_SHADOWS } from '../constants/colors';
import { getTodayDate, formatDateToYYYYMMDD, parseDateFromYYYYMMDD } from '../common/utils/dateUtils';

interface AddExpenseProps {
  expense?: Expense | null;
  onExpenseAdded?: () => void;
  onClose?: () => void;
}

const AddExpense: React.FC<AddExpenseProps> = ({ expense, onExpenseAdded, onClose }) => {
  const [formData, setFormData] = useState<ExpenseRequest>({
    amount: expense?.amount || 0,
    description: expense?.description || '',
    kind: expense?.kind || 'expense',
    type: expense?.type || '',
    resource: expense?.resource || undefined,
    currency: expense?.currency || 'VND',
    date: expense?.date || getTodayDate(),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);

  // Update formData when expense prop changes
  useEffect(() => {
    if (expense) {
      setFormData({
        amount: Math.abs(expense.amount), // Always show positive in UI
        description: expense.description || '',
        kind: expense.kind,
        type: expense.type,
        resource: expense.resource || undefined,
        currency: expense.currency,
        date: expense.date,
      });
    } else {
      setFormData({
        amount: 0,
        description: '',
        kind: 'expense',
        type: '',
        resource: undefined,
        currency: 'VND',
        date: getTodayDate(),
      });
    }
  }, [expense]);

  // Update user_id if localStorage changes (e.g., login/logout)
  useEffect(() => {
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
      // Convert date to YYYY-MM-DD format
      const dateStr = typeof formData.date === 'string' 
        ? formData.date 
        : formatDateToYYYYMMDD(new Date(formData.date));
      
      // Convert amount: negative for expense, positive for income
      let amount = formData.amount;
      if (formData.kind === 'expense' && amount > 0) {
        amount = -amount;
      } else if (formData.kind === 'income' && amount < 0) {
        amount = -amount;
      }
      
      const expenseData = { 
        ...formData,
        amount: amount,
        type: formData.type.trim().toLowerCase(),
        date: dateStr
      };

      if (expense) {
        // Update existing expense
        await expenseService.updateExpense(expense.id, expenseData);
      } else {
        // Create new expense
        await expenseService.createExpense(expenseData);
      }
      
      setSuccess(true);
      setFormData({
        amount: 0,
        description: '',
        kind: 'expense',
        type: '',
        resource: undefined,
        currency: 'VND',
        date: getTodayDate(),
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
    <Container maxWidth="md" sx={{ px: { xs: 0, sm: 2 } }}>
      <Paper elevation={0} sx={{ 
        p: { xs: 2.5, sm: 4 }, 
        position: 'relative',
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
          {expense ? 'Edit Transaction' : 'Add New Transaction'}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} variant="filled">{error}</Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} variant="filled">
            Transaction {expense ? 'updated' : 'added'} successfully!
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                sx={{ 
                  flex: '1 1 200px',
                  '& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button': {
                    display: 'none',
                  },
                  '& input[type=number]': {
                    MozAppearance: 'textfield',
                  },
                }}
                label="Amount"
                type="number"
                value={formData.amount || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow positive numbers (integers and decimals)
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    handleChange('amount', value === '' ? 0 : parseFloat(value) || 0);
                  }
                }}
                required
                inputProps={{ min: 0 }}
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
              <TextField
                sx={{ flex: '1 1 150px' }}
                select
                label="Resource"
                value={formData.resource || ''}
                onChange={(e) => handleChange('resource', e.target.value)}
                disabled={loading}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {EXPENSE_RESOURCES.map((option) => (
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
              multiline
              rows={3}
              disabled={loading}
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date"
                value={formData.date ? parseDateFromYYYYMMDD(formData.date) : new Date()}
                onChange={(date) => {
                  if (date) {
                    handleChange('date', formatDateToYYYYMMDD(date));
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
              {loading ? <CircularProgress size={24} /> : (expense ? 'Update Transaction' : 'Add Transaction')}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddExpense;
