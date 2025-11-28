import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  IconButton,
  Collapse,
  Button,
  Avatar,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { 
  FilterList, 
  Close, 
  TrendingUp, 
  TrendingDown, 
  AccountBalance,
} from '@mui/icons-material';
import { expenseService } from '../services/expenseService';
import type { ExpenseFilter, ExpenseSummary as ExpenseSummaryType } from '../services/expenseService';
import type { ExpenseKind } from '../types/api';
import { useNavigate } from 'react-router-dom';
import { CURRENCIES, CURRENCY_SYMBOLS } from '../constants/currencies';
import { DATETIME_WITH_TIMEZONE_FORMAT, EXPENSE_KINDS } from '../constants/expense';

const Summary: React.FC = () => {
  const [summary, setSummary] = useState<ExpenseSummaryType | null>(null);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [baseCurrency, setBaseCurrency] = useState<string>('VND');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  // Date filter states
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  const fetchSummary = async (filterParams?: ExpenseFilter) => {
    setLoading(true);
    setError(null);
    try {
      const summaryData = await expenseService.getSummary(filterParams);
      setSummary(summaryData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch summary');
      setSummary(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSummary();
    expenseService.getUniqueTypes().then(types => setAvailableTypes(types)).catch(() => {});
    expenseService.getExchangeRates().then(data => {
      setExchangeRates(data.rates);
      setBaseCurrency(data.base_currency);
    }).catch(() => {});
    // eslint-disable-next-line
  }, []);

  const handleFilterChange = (field: keyof ExpenseFilter, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value || undefined,
    }));
  };

  const handleApplyFilters = () => {
    const cleanFilters: ExpenseFilter = {};
    if (filters.kind) cleanFilters.kind = filters.kind;
    if (filters.type) cleanFilters.type = filters.type;
    if (filters.currencies && filters.currencies.length > 0) cleanFilters.currencies = filters.currencies;
    if (filters.default_currency) cleanFilters.default_currency = filters.default_currency;
    if (fromDate) {
      const startOfDay = new Date(fromDate);
      startOfDay.setHours(0, 0, 0, 0);
      cleanFilters.from = format(startOfDay, DATETIME_WITH_TIMEZONE_FORMAT);
    }
    if (toDate) {
      const endOfDay = new Date(toDate);
      endOfDay.setHours(23, 59, 59, 999);
      cleanFilters.to = format(endOfDay, DATETIME_WITH_TIMEZONE_FORMAT);
    }
    fetchSummary(cleanFilters);
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
    fetchSummary({});
  };

  const hasActiveFilters = filters.kind || filters.type || (filters.currencies && filters.currencies.length > 0) || fromDate || toDate;

  const formatCurrency = (amount: number, currency: string) => {
    const decimals = currency === 'VND' ? 0 : 2;
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    return `${formatted} ${symbol}`;
  };

  const calculateTotals = () => {
    if (!summary) {
      return { mode: 'empty' as const, converted: null, byCurrency: {} };
    }
    
    if (summary.by_currency) {
      return {
        mode: 'breakdown' as const,
        converted: {
          currency: summary.currency,
          income: summary.total_income,
          expense: summary.total_expense,
          balance: summary.balance,
        },
        byCurrency: Object.entries(summary.by_currency).reduce((acc, [currency, data]) => {
          acc[currency] = {
            income: data.total_income,
            expense: data.total_expense,
            balance: data.balance,
          };
          return acc;
        }, {} as Record<string, { income: number; expense: number; balance: number }>),
      };
    }
    
    return {
      mode: 'single' as const,
      single: {
        currency: summary.currency,
        income: summary.total_income,
        expense: summary.total_expense,
        balance: summary.balance,
      },
      byCurrency: {},
    };
  };

  const totals = calculateTotals();

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
        {/* Exchange Rates Info */}
        {totals.mode === 'breakdown' && Object.keys(exchangeRates).length > 0 && (
          <Box mb={3}>
            <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Exchange Rates to {baseCurrency}:</strong>
                {Object.entries(exchangeRates)
                  .filter(([curr]) => curr !== baseCurrency)
                  .map(([currency, rate]) => (
                    <span key={currency} style={{ marginLeft: '16px' }}>
                      1 {currency} = {rate.toLocaleString()} {CURRENCY_SYMBOLS[baseCurrency] || baseCurrency}
                    </span>
                  ))}
              </Typography>
            </Paper>
          </Box>
        )}

        {/* Filter Section */}
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <Button 
            variant={showFilters ? "contained" : "outlined"}
            startIcon={<FilterList />} 
            onClick={() => setShowFilters(!showFilters)}
            color={hasActiveFilters ? "primary" : "inherit"}
            size="medium"
          >
            Filters {hasActiveFilters && `(${Object.values({...filters, from: fromDate, to: toDate}).filter(v => v !== undefined && v !== null).length})`}
          </Button>
        </Box>

        <Collapse in={showFilters}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" gap={2} flexWrap="wrap">
                <TextField
                  sx={{ flex: '1 1 200px' }}
                  select
                  label="Kind"
                  value={filters.kind || ''}
                  onChange={(e) => handleFilterChange('kind', e.target.value)}
                  size="small"
                >
                  <MenuItem value="">All</MenuItem>
                  {EXPENSE_KINDS.map((kind) => (
                    <MenuItem key={kind} value={kind}>
                      {kind.charAt(0).toUpperCase() + kind.slice(1)}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  sx={{ flex: '1 1 200px' }}
                  select
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

                <TextField
                  sx={{ flex: '1 1 200px' }}
                  select
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

                <TextField
                  sx={{ flex: '1 1 200px' }}
                  select
                  label="Default Currency"
                  value={filters.default_currency || 'VND'}
                  onChange={(e) => handleFilterChange('default_currency', e.target.value)}
                  size="small"
                  helperText="For conversion"
                >
                  {CURRENCIES.map((currency) => (
                    <MenuItem key={currency} value={currency}>
                      {currency}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <DatePicker
                    label="From Date"
                    value={fromDate}
                    onChange={(date) => setFromDate(date)}
                    slotProps={{ textField: { size: 'small', sx: { flex: '1 1 200px' } } }}
                  />
                  <DatePicker
                    label="To Date"
                    value={toDate}
                    onChange={(date) => setToDate(date)}
                    slotProps={{ textField: { size: 'small', sx: { flex: '1 1 200px' } } }}
                  />
                </Box>
              </LocalizationProvider>

              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={handleClearFilters}>
                  Clear
                </Button>
                <Button variant="contained" onClick={handleApplyFilters}>
                  Apply Filters
                </Button>
              </Box>
            </Box>
          </Paper>
        </Collapse>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        {totals.mode === 'single' && totals.single && (
          <Box mb={4}>
            <Box display="flex" flexWrap="wrap" gap={2}>
              <Card sx={{ 
                flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 11px)' },
                minWidth: '250px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                color: 'white' 
              }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                        Total Income
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                        {formatCurrency(totals.single.income, totals.single.currency)}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}>
                      <TrendingUp />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>

              <Card sx={{ 
                flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 11px)' },
                minWidth: '250px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
                color: 'white' 
              }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                        Total Expenses
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                        {formatCurrency(totals.single.expense, totals.single.currency)}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}>
                      <TrendingDown />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>

              <Card sx={{ 
                flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 11px)' },
                minWidth: '250px',
                background: totals.single.balance >= 0 
                  ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' 
                  : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', 
                color: 'white' 
              }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                        Balance
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                        {formatCurrency(Math.abs(totals.single.balance), totals.single.currency)}
                      </Typography>
                      <Typography variant="caption">
                        {totals.single.balance >= 0 ? 'Surplus' : 'Deficit'}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}>
                      <AccountBalance />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}

        {totals.mode === 'breakdown' && totals.converted && (
          <>
            <Box mb={3}>
              <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
                Total (Converted to {totals.converted.currency})
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={2}>
                <Card sx={{ 
                  flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 11px)' },
                  minWidth: '250px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                  color: 'white' 
                }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                          Total Income
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                          {formatCurrency(totals.converted.income, totals.converted.currency)}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}>
                        <TrendingUp />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>

                <Card sx={{ 
                  flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 11px)' },
                  minWidth: '250px',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
                  color: 'white' 
                }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                          Total Expenses
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                          {formatCurrency(totals.converted.expense, totals.converted.currency)}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}>
                        <TrendingDown />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>

                <Card sx={{ 
                  flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 11px)' },
                  minWidth: '250px',
                  background: totals.converted.balance >= 0 
                    ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' 
                    : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', 
                  color: 'white' 
                }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                          Balance
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                          {formatCurrency(Math.abs(totals.converted.balance), totals.converted.currency)}
                        </Typography>
                        <Typography variant="caption">
                          {totals.converted.balance >= 0 ? 'Surplus' : 'Deficit'}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}>
                        <AccountBalance />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Box>

            {Object.entries(totals.byCurrency).map(([currency, data]) => (
              <Box key={currency} mb={3}>
                <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
                  {currency} (Original)
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={2}>
                  <Card sx={{ 
                    flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 11px)' },
                    minWidth: '250px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                    color: 'white' 
                  }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                            Income
                          </Typography>
                          <Typography variant="h5" fontWeight="bold">
                            {formatCurrency(data.income, currency)}
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 40, height: 40 }}>
                          <TrendingUp fontSize="small" />
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>

                  <Card sx={{ 
                    flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 11px)' },
                    minWidth: '250px',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
                    color: 'white' 
                  }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                            Expenses
                          </Typography>
                          <Typography variant="h5" fontWeight="bold">
                            {formatCurrency(data.expense, currency)}
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 40, height: 40 }}>
                          <TrendingDown fontSize="small" />
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>

                  <Card sx={{ 
                    flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 11px)' },
                    minWidth: '250px',
                    background: data.balance >= 0 
                      ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' 
                      : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', 
                    color: 'white' 
                  }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                            Balance
                          </Typography>
                          <Typography variant="h5" fontWeight="bold">
                            {formatCurrency(Math.abs(data.balance), currency)}
                          </Typography>
                          <Typography variant="caption">
                            {data.balance >= 0 ? 'Surplus' : 'Deficit'}
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 40, height: 40 }}>
                          <AccountBalance fontSize="small" />
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            ))}
          </>
        )}
      </Container>
    </Box>
  );
};

export default Summary;
