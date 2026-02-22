import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  Skeleton,
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Divider,
  Fade,
  Popover,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Container,
} from '@mui/material';
import { FilterList, Add, Edit, Delete, WarningAmber } from '@mui/icons-material';
import { expenseService } from '../services/expenseService';
import type { ExpenseFilter, ExpenseSummary } from '../services/expenseService';
import type { Expense } from '../types/api';
import AddExpense from './AddExpense';
import { CURRENCY_SYMBOLS } from '../constants/currencies';
import { COLORS, BOX_SHADOWS } from '../constants/colors';
import FilterSection from '../common/FilterSection';
import { formatDateForDisplay, formatDateToYYYYMMDD } from '../common/utils/dateUtils';

const Dashboard: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>(['VND', 'USD']);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Filter states
  const [filters, setFilters] = useState<ExpenseFilter>({
    kind: undefined,
    type: undefined,
    currencies: undefined,
    original_currency: 'VND',
    from: undefined,
    to: undefined,
    group_by: undefined,
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
    // Fetch available types and currencies
    expenseService.getUniqueTypes().then(types => setAvailableTypes(types)).catch(() => {});
    expenseService.getAvailableCurrencies().then(currencies => setAvailableCurrencies(currencies)).catch(() => {});
    // eslint-disable-next-line
  }, []);

  const handleOpen = () => {
    setEditingExpense(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingExpense(null);
  };

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
    if (filters.original_currency) cleanFilters.original_currency = filters.original_currency;
    if (filters.group_by) cleanFilters.group_by = filters.group_by;
    if (fromDate) {
      // Format as YYYY-MM-DD
      cleanFilters.from = formatDateToYYYYMMDD(fromDate);
    }
    if (toDate) {
      // Format as YYYY-MM-DD
      cleanFilters.to = formatDateToYYYYMMDD(toDate);
    }
    
    console.log('Applying filters:', cleanFilters);
    fetchExpenses(cleanFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      kind: undefined,
      type: undefined,
      currencies: undefined,
      original_currency: 'VND',
      from: undefined,
      to: undefined,
      group_by: undefined,
    });
    setFromDate(null);
    setToDate(null);
    fetchExpenses({});
  };

  const handleDeleteExpense = async (id: number) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirmId === null) return;
    try {
      await expenseService.deleteExpense(deleteConfirmId);
      fetchExpenses(filters);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete expense');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setOpen(true);
  };

  const hasActiveFilters = !!(filters.kind || filters.type || (filters.currencies && filters.currencies.length > 0) || fromDate || toDate);

  const formatCurrency = (amount: number, currency: string) => {
    const decimals = currency === 'VND' ? 0 : 2;
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    return `${formatted} ${symbol}`;
  };

  const formatDate = (dateString: string) => {
    return formatDateForDisplay(dateString);
  };

  if (loading && !expenses.length) {
    // show skeleton inline in table instead of full-page spinner
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: COLORS.background.main }}>
      <Container maxWidth={false} disableGutters sx={{ mt: 4, mb: 4, flexGrow: 1, px: { xs: 2, sm: 3, md: 4 } }}>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmId !== null} onClose={() => setDeleteConfirmId(null)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
          <WarningAmber sx={{ color: '#EA5455' }} />
          Delete Transaction
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone. The transaction will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteConfirmId(null)} variant="outlined" size="small">
            Cancel
          </Button>
          <Button onClick={confirmDelete} variant="contained" size="small"
            sx={{ bgcolor: '#EA5455', '&:hover': { bgcolor: '#d43d3e' } }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Expense Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { boxShadow: 'none', borderRadius: 4 } }}
      >
        <DialogContent sx={{ p: 0 }}>
          <AddExpense
            expense={editingExpense}
            onExpenseAdded={() => { handleClose(); fetchExpenses(); }}
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
          p: 2, 
          mb: 2, 
          borderRadius: 2, 
          background: COLORS.gradients.primary,
          boxShadow: BOX_SHADOWS.card,
        }} elevation={0}>
          <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ color: COLORS.text.secondary }}>
              Transaction Summary
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1.5}>
              <Chip label={`Total: ${expenses.length}`} size="small" sx={{ bgcolor: 'action.hover' }} />
              <Chip label={`Income: ${formatCurrency(summary.total_income, summary.currency)}`} size="small" color="success" variant="outlined" />
              <Chip label={`Expense: ${formatCurrency(summary.total_expense, summary.currency)}`} size="small" color="error" variant="outlined" />
              <Chip label={`Balance: ${formatCurrency(Math.abs(summary.balance), summary.currency)}`} size="small" variant="outlined" />
            </Box>
          </Box>
        </Paper>
      )}

      {/* Filter Section moved below summary and above transactions */}
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <Button 
          variant="outlined"
          startIcon={<FilterList />} 
          onClick={(e) => setFilterAnchorEl(filterAnchorEl ? null : e.currentTarget)}
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

      <Popover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={() => setFilterAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{ sx: { mt: 1, width: 720, maxWidth: '95vw', borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' } }}
      >
        <FilterSection
          filters={filters}
          fromDate={fromDate}
          toDate={toDate}
          availableTypes={availableTypes}
          availableCurrencies={availableCurrencies}
          onFilterChange={handleFilterChange}
          onApplyFilters={() => { handleApplyFilters(); setFilterAnchorEl(null); }}
          onClearFilters={handleClearFilters}
          onClose={() => setFilterAnchorEl(null)}
          hasActiveFilters={hasActiveFilters}
        />
      </Popover>

      <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }} elevation={2}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="h5" fontWeight={600}>
            Transactions
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleOpen} size="small"
            sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #28C76F 100%)', boxShadow: '0 4px 12px rgba(40,199,111,0.3)', '&:hover': { boxShadow: '0 6px 16px rgba(40,199,111,0.4)', transform: 'translateY(-1px)' }, transition: 'all 0.2s ease' }}>
            Add Transaction
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {loading || expenses.length > 0 ? (
          <TableContainer>
            <Table sx={{ minWidth: 650 }} size="medium">
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Kind</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Resource</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton variant="text" width={80} /></TableCell>
                      <TableCell><Skeleton variant="rounded" width={64} height={24} /></TableCell>
                      <TableCell align="right"><Skeleton variant="text" width={90} /></TableCell>
                      <TableCell><Skeleton variant="text" width={60} /></TableCell>
                      <TableCell><Skeleton variant="text" width={70} /></TableCell>
                      <TableCell><Skeleton variant="text" width={120} /></TableCell>
                      <TableCell align="center"><Skeleton variant="rounded" width={64} height={32} /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  expenses.map((expense, index) => (
                  <Fade in={true} timeout={300 + index * 50} key={expense.id}>
                    <TableRow
                      sx={{ 
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                        '&:last-child td, &:last-child th': { border: 0 },
                        borderLeft: expense.kind === 'income' ? '3px solid #28C76F' : '3px solid #EA5455',
                        transition: 'background 0.15s, transform 0.15s',
                        '&:hover td:first-of-type': { paddingLeft: '13px' },
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(expense.date)}
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
                          {formatCurrency(Math.abs(expense.amount), expense.currency)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {expense.type}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {expense.resource || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {expense.description || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" gap={0.5} justifyContent="center">
                          <Tooltip title="Edit">
                            <IconButton 
                              size="small" 
                              onClick={() => handleEditExpense(expense)}
                              sx={{ color: 'primary.main' }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteExpense(expense.id)}
                              sx={{ color: 'error.main' }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  </Fade>
                  ))
                )}
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
