import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogContent,
  Collapse,
  Divider,
  Fade,
  Fab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { format } from 'date-fns';
import { FilterList, Add } from '@mui/icons-material';
import { expenseService } from '../services/expenseService';
import type { ExpenseFilter, ExpenseSummary } from '../services/expenseService';
import type { Expense } from '../types/api';
import AddExpense from './AddExpense';
import { CURRENCY_SYMBOLS } from '../constants/currencies';
import { DATETIME_WITH_TIMEZONE_FORMAT } from '../constants/expense';
import { COLORS, BOX_SHADOWS } from '../constants/colors';
import FilterSection from '../common/FilterSection';

const Dashboard: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);

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

  const handleFilterChange = (field: keyof ExpenseFilter | 'from_date' | 'to_date', value: any) => {
    if (field === 'from_date') {
      setFromDate(value);
    } else if (field === 'to_date') {
      setToDate(value);
    } else {
      setFilters(prev => ({
        ...prev,
        [field]: value || undefined,
      }));
    }
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

  const hasActiveFilters = !!(filters.kind || filters.type || (filters.currencies && filters.currencies.length > 0) || fromDate || toDate);

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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: COLORS.background.main }}>
      <Container maxWidth={false} disableGutters sx={{ mt: 4, mb: 4, flexGrow: 1, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Filter Section */}
        <Box display="flex" gap={2} mb={2} flexWrap="wrap">
          <Button 
            variant="outlined"
            startIcon={<FilterList />} 
            onClick={() => setShowFilters(!showFilters)}
            size="small"
            sx={{ 
              fontSize: '0.875rem',
              borderRadius: 2,
              fontWeight: 600,
              color: COLORS.text.secondary,
              borderColor: COLORS.background.border,
              '&:hover': {
                borderColor: COLORS.text.tertiary,
                bgcolor: COLORS.background.hover,
              },
            }}
          >
            Filters {hasActiveFilters && `(${Object.values(filters).filter(v => v).length})`}
          </Button>
        </Box>

      <Collapse in={showFilters}>
        <FilterSection
          filters={filters}
          fromDate={fromDate}
          toDate={toDate}
          availableTypes={availableTypes}
          onFilterChange={handleFilterChange}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          onClose={() => setShowFilters(false)}
          hasActiveFilters={hasActiveFilters}
        />
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

      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            boxShadow: 'none',
            borderRadius: 4,
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
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

      {/* Summary Section */}
      {expenses.length > 0 && summary && (
        <Paper sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 3, 
          background: COLORS.gradients.primary,
          boxShadow: BOX_SHADOWS.card,
        }} elevation={0}>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: COLORS.text.secondary }}>
            Transaction Summary
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={3} mt={2}>
            <Box flex="1 1 200px">
              <Typography variant="body2" sx={{ color: COLORS.text.tertiary, mb: 0.5 }}>
                Total Transactions
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ color: COLORS.text.primary }}>
                {expenses.length}
              </Typography>
            </Box>
            <Box flex="1 1 200px">
              <Typography variant="body2" sx={{ color: COLORS.text.tertiary, mb: 0.5 }}>
                Total Income
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ color: COLORS.income.main }}>
                {formatCurrency(summary.total_income, summary.currency)}
              </Typography>
              <Typography variant="caption" sx={{ color: COLORS.text.quaternary }}>
                {expenses.filter(e => e.kind === 'income').length} transactions
              </Typography>
            </Box>
            <Box flex="1 1 200px">
              <Typography variant="body2" sx={{ color: COLORS.text.tertiary, mb: 0.5 }}>
                Total Expenses
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ color: COLORS.expense.main }}>
                {formatCurrency(summary.total_expense, summary.currency)}
              </Typography>
              <Typography variant="caption" sx={{ color: COLORS.text.quaternary }}>
                {expenses.filter(e => e.kind === 'expense').length} transactions
              </Typography>
            </Box>
            <Box flex="1 1 200px">
              <Typography variant="body2" sx={{ color: COLORS.text.tertiary, mb: 0.5 }}>
                Balance
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ color: summary.balance >= 0 ? COLORS.income.main : COLORS.expense.main }}>
                {formatCurrency(Math.abs(summary.balance), summary.currency)}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }} elevation={2}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Transactions
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {expenses.length > 0 ? (
          <TableContainer>
            <Table sx={{ minWidth: 650 }} size="medium">
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Kind</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Currency</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.map((expense, index) => (
                  <Fade in={true} timeout={300 + index * 50} key={expense.id}>
                    <TableRow
                      sx={{ 
                        '&:hover': { bgcolor: 'action.hover' },
                        '&:last-child td, &:last-child th': { border: 0 }
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(expense.date)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" fontWeight={500}>
                          {expense.description || 'No description'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {expense.type}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={expense.kind}
                          size="small"
                          color={expense.kind === 'income' ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body1"
                          fontWeight={600}
                          color={expense.kind === 'income' ? 'success.main' : 'error.main'}
                        >
                          {expense.kind === 'income' ? '+' : '-'}
                          {formatCurrency(expense.amount, expense.currency)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {expense.currency}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </Fade>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
