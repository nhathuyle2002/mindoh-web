import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogContent,
  TextField,
  MenuItem,
  IconButton,
  Collapse,
  Divider,
  Fade,
  Fab,
  Stack,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { 
  FilterList, 
  Close, 
  Add, 
} from '@mui/icons-material';
import { expenseService } from '../services/expenseService';
import type { ExpenseFilter, ExpenseSummary } from '../services/expenseService';
import type { Expense, ExpenseKind } from '../types/api';
import AddExpense from './AddExpense';
import { useNavigate } from 'react-router-dom';
import { CURRENCIES, CURRENCY_SYMBOLS } from '../constants/currencies';
import { DATETIME_WITH_TIMEZONE_FORMAT } from '../constants/expense';

const Dashboard: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const navigate = useNavigate();

  // Filter states
  const [filters, setFilters] = useState<ExpenseFilter>({
    kind: undefined,
    type: undefined,
    currencies: undefined,
    default_currency: 'VND',
    from: undefined,
    to: undefined,
  });

  // Date filter states (stored as Date objects for DatePicker)
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  // Add this function to fetch and update expenses
  const fetchExpenses = async (filterParams?: ExpenseFilter) => {
    setLoading(true);
    setError(null);
    let summaryData: ExpenseSummary | null = null;
    let errorMsg: string | null = null;
    try {
      summaryData = await expenseService.getSummary(filterParams);
    } catch (err: any) {
      errorMsg = err.response?.data?.message || 'Failed to fetch expenses';
    }
    if (summaryData) {
      setExpenses(summaryData.expenses);
      setSummary(summaryData);
    } else {
      setExpenses([]);
      setSummary(null);
    }
    setError(errorMsg);
    setLoading(false);
  };

  useEffect(() => {
    fetchExpenses();
    // Fetch available types
    expenseService.getUniqueTypes().then(types => setAvailableTypes(types)).catch(() => {});
    // eslint-disable-next-line
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleFilterChange = (field: keyof ExpenseFilter, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value || undefined,
    }));
  };

  const handleApplyFilters = () => {
    // Remove empty filter values
    const cleanFilters: ExpenseFilter = {};
    if (filters.kind) cleanFilters.kind = filters.kind;
    if (filters.type) cleanFilters.type = filters.type;
    if (filters.currencies && filters.currencies.length > 0) cleanFilters.currencies = filters.currencies;
    if (filters.default_currency) cleanFilters.default_currency = filters.default_currency;
    if (fromDate) {
      // Set to start of day (00:00:00) in local timezone
      const startOfDay = new Date(fromDate);
      startOfDay.setHours(0, 0, 0, 0);
      // Format with timezone: 2025-11-27T00:00:00+07:00
      cleanFilters.from = format(startOfDay, DATETIME_WITH_TIMEZONE_FORMAT);
    }
    if (toDate) {
      // Set to end of day (23:59:59) in local timezone
      const endOfDay = new Date(toDate);
      endOfDay.setHours(23, 59, 59, 999);
      // Format with timezone: 2025-11-27T23:59:59+07:00
      cleanFilters.to = format(endOfDay, DATETIME_WITH_TIMEZONE_FORMAT);
    }
    
    console.log('Applying filters:', cleanFilters);
    fetchExpenses(cleanFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      kind: undefined,
      type: undefined,
      currencies: undefined,
      default_currency: 'VND',
      from: undefined,
      to: undefined,
    });
    setFromDate(null);
    setToDate(null);
    fetchExpenses({});
  };

  const hasActiveFilters = filters.kind || filters.type || (filters.currencies && filters.currencies.length > 0) || fromDate || toDate;

  const formatCurrency = (amount: number, currency: string) => {
    // VND doesn't use decimal places
    const decimals = currency === 'VND' ? 0 : 2;
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    return `${formatted} ${symbol}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryColor = (category: string | undefined) => {
    if (!category) return 'default';
    const colors: { [key: string]: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' } = {
      food: 'error',
      transport: 'warning',
      entertainment: 'secondary',
      health: 'error',
      shopping: 'info',
      bill: 'warning',
      salary: 'success',
      bonus: 'success',
      gift: 'info',
    };
    return colors[category.toLowerCase()] || 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Container maxWidth={false} disableGutters sx={{ mt: 4, mb: 4, flexGrow: 1, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Filter Section */}
        <Box display="flex" gap={2} mb={2} flexWrap="wrap">
          <Button 
            variant={showFilters ? "contained" : "outlined"}
            startIcon={<FilterList />} 
            onClick={() => setShowFilters(!showFilters)}
            color={hasActiveFilters ? "primary" : "inherit"}
            size="medium"
            sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}
          >
            Filters {hasActiveFilters && `(${Object.values(filters).filter(v => v).length})`}
          </Button>
        </Box>

      <Collapse in={showFilters}>
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }} elevation={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight={600}>Filter Expenses</Typography>
            <IconButton size="small" onClick={() => setShowFilters(false)}>
              <Close />
            </IconButton>
          </Box>
          <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
            <Box flex="1 1 200px" minWidth={{ xs: '100%', sm: '200px' }}>
              <TextField
                select
                fullWidth
                label="Kind"
                value={filters.kind || ''}
                onChange={(e) => handleFilterChange('kind', e.target.value as ExpenseKind)}
                size="small"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
                <MenuItem value="income">Income</MenuItem>
              </TextField>
            </Box>
            <Box flex="1 1 200px" minWidth={{ xs: '100%', sm: '200px' }}>
              <TextField
                select
                fullWidth
                label="Type"
                value={filters.type || ''}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                size="small"
              >
                <MenuItem value="">All</MenuItem>
                {availableTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box flex="1 1 200px" minWidth={{ xs: '100%', sm: '200px' }}>
              <TextField
                select
                fullWidth
                label="Currencies"
                value={filters.currencies || []}
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterChange('currencies', typeof value === 'string' ? value.split(',') : value);
                }}
                SelectProps={{
                  multiple: true,
                  renderValue: (selected) => (selected as string[]).join(', '),
                }}
                size="small"
              >
                {CURRENCIES.map((currency) => (
                  <MenuItem key={currency} value={currency}>
                    {currency}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box flex="1 1 200px" minWidth={{ xs: '100%', sm: '200px' }}>
              <TextField
                select
                fullWidth
                label="Default Currency"
                value={filters.default_currency || 'VND'}
                onChange={(e) => handleFilterChange('default_currency', e.target.value)}
                size="small"
                helperText="For conversion when no currency filter"
              >
                {CURRENCIES.map((currency) => (
                  <MenuItem key={currency} value={currency}>
                    {currency}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box flex="1 1 200px" minWidth={{ xs: '100%', sm: '200px' }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="From Date"
                  value={fromDate}
                  onChange={(newValue) => setFromDate(newValue)}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true, 
                      size: 'small' 
                    } 
                  }}
                />
              </LocalizationProvider>
            </Box>
            <Box flex="1 1 200px" minWidth={{ xs: '100%', sm: '200px' }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="To Date"
                  value={toDate}
                  onChange={(newValue) => setToDate(newValue)}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true, 
                      size: 'small' 
                    } 
                  }}
                />
              </LocalizationProvider>
            </Box>
          </Box>
          <Box display="flex" gap={2} mt={3}>
            <Button variant="contained" size="large" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
            <Button variant="outlined" size="large" onClick={handleClearFilters}>
              Clear All
            </Button>
          </Box>
        </Paper>
      </Collapse>

      {/* Floating Action Button */}
      <Fab 
        color="primary" 
        aria-label="add"
        sx={{ 
          position: 'fixed', 
          bottom: { xs: 16, sm: 24 }, 
          right: { xs: 16, sm: 24 },
          display: { xs: 'flex', sm: 'flex' }
        }}
        onClick={handleOpen}
      >
        <Add />
      </Fab>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogContent>
          <AddExpense 
            onExpenseAdded={() => { 
              handleClose(); 
              fetchExpenses(); 
            }} 
            onClose={handleClose}
          />
        </DialogContent>
      </Dialog>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} variant="filled">{error}</Alert>
      )}

      <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }} elevation={2}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Recent Transactions
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {expenses.length > 0 ? (
          <List sx={{ '& .MuiListItem-root:hover': { bgcolor: 'action.hover' } }}>
            {expenses.map((expense, index) => (
              <Fade in={true} timeout={300 + index * 50} key={expense.id}>
                <ListItem 
                  divider={index !== expenses.length - 1}
                  sx={{ 
                    py: 2,
                    px: { xs: 1, sm: 2 },
                    borderRadius: 1,
                    mb: 0.5,
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' }
                  }}
                >
                  <ListItemText
                    sx={{ width: '100%' }}
                    primary={
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} flexWrap="wrap" gap={1}>
                        <Typography variant="body1" fontWeight={500} sx={{ flex: '1 1 auto' }}>
                          {expense.description || 'No description'}
                        </Typography>
                        <Typography 
                          variant="h6"
                          fontWeight={600}
                          color={expense.kind === 'income' ? 'success.main' : 'error.main'}
                          sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                        >
                          {expense.kind === 'income' ? '+' : '-'}
                          {formatCurrency(expense.amount, expense.currency)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          <Chip
                            label={expense.kind}
                            size="small"
                            color={expense.kind === 'income' ? 'success' : 'default'}
                            variant="outlined"
                          />
                          <Chip
                            label={expense.type}
                            color={getCategoryColor(expense.type) as any}
                            size="small"
                          />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(expense.date)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              </Fade>
            ))}
          </List>
        ) : (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No transactions found
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Start tracking your finances by adding your first transaction
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
              Add Transaction
            </Button>
          </Box>
        )}
      </Paper>
      </Container>
    </Box>
  );
};

export default Dashboard;
