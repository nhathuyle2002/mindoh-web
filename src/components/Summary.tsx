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
  Collapse,
  Button,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { format } from 'date-fns';
import { 
  FilterList, 
  TrendingUp, 
  TrendingDown, 
  AccountBalance,
} from '@mui/icons-material';
import { PieChart } from '@mui/x-charts/PieChart';
import { expenseService } from '../services/expenseService';
import type { ExpenseFilter, ExpenseSummary as ExpenseSummaryType } from '../services/expenseService';
import { CURRENCY_SYMBOLS } from '../constants/currencies';
import { DATETIME_WITH_TIMEZONE_FORMAT } from '../constants/expense';
import { COLORS, BOX_SHADOWS } from '../constants/colors';
import FilterSection from '../common/FilterSection';

const Summary: React.FC = () => {
  const [summary, setSummary] = useState<ExpenseSummaryType | null>(null);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [baseCurrency, setBaseCurrency] = useState<string>('VND');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>(['VND', 'USD']);

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
    expenseService.getAvailableCurrencies().then(currencies => setAvailableCurrencies(currencies)).catch(() => {});
    expenseService.getExchangeRates().then(data => {
      setExchangeRates(data.rates);
      setBaseCurrency(data.base_currency);
    }).catch(() => {});
    // eslint-disable-next-line
  }, []);

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
    const cleanFilters: ExpenseFilter = {};
    if (filters.kind) cleanFilters.kind = filters.kind;
    if (filters.type) cleanFilters.type = filters.type;
    if (filters.currencies && filters.currencies.length > 0) cleanFilters.currencies = filters.currencies;
    if (filters.original_currency) cleanFilters.original_currency = filters.original_currency;
    if (filters.group_by) cleanFilters.group_by = filters.group_by;
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
    setShowFilters(false);
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
    fetchSummary({});
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

  const calculateTotals = () => {
    if (!summary) {
      return { mode: 'empty' as const, converted: null, byCurrency: {} };
    }
    
    if (summary.by_currency) {
      // Create a complete map with all available currencies
      const allCurrencies = availableCurrencies.reduce((acc, currency) => {
        acc[currency] = {
          income: 0,
          expense: 0,
          balance: 0,
        };
        return acc;
      }, {} as Record<string, { income: number; expense: number; balance: number }>);

      // Merge with actual data from summary
      Object.entries(summary.by_currency).forEach(([currency, data]) => {
        allCurrencies[currency] = {
          income: data.total_income,
          expense: data.total_expense,
          balance: data.balance,
        };
      });

      return {
        mode: 'breakdown' as const,
        converted: {
          currency: summary.currency,
          income: summary.total_income,
          expense: summary.total_expense,
          balance: summary.balance,
        },
        byCurrency: allCurrencies,
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" bgcolor={COLORS.background.main}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: COLORS.background.main }}>
      <Container maxWidth={false} disableGutters sx={{ mt: 4, mb: 4, flexGrow: 1, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Exchange Rates Info */}
        {totals.mode === 'breakdown' && Object.keys(exchangeRates).length > 0 && (
          <Box mb={2}>
            <Typography variant="caption" sx={{ color: COLORS.text.tertiary, mr: 2 }}>
              Exchange Rates to {baseCurrency}:
            </Typography>
            {Object.entries(exchangeRates)
              .filter(([curr]) => curr !== baseCurrency)
              .map(([currency, rate], index) => (
                <Typography 
                  key={currency} 
                  component="span"
                  variant="caption" 
                  sx={{ 
                    color: COLORS.text.secondary, 
                    mr: 2,
                  }}
                >
                  {index > 0 && '• '}1 {currency} = {rate.toLocaleString()} {CURRENCY_SYMBOLS[baseCurrency] || baseCurrency}
                </Typography>
              ))}
          </Box>
        )}

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
                background: COLORS.gradients.income, 
                color: 'white',
                borderRadius: 4,
                boxShadow: BOX_SHADOWS.income,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 60px rgba(102, 126, 234, 0.4)',
                },
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
                background: COLORS.gradients.expense, 
                color: 'white',
                borderRadius: 4,
                boxShadow: BOX_SHADOWS.expense,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 60px rgba(240, 147, 251, 0.4)',
                },
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
                  ? COLORS.gradients.balancePositive 
                  : COLORS.gradients.balanceNegative, 
                color: 'white',
                borderRadius: 4,
                boxShadow: totals.single.balance >= 0
                  ? BOX_SHADOWS.balancePositive
                  : BOX_SHADOWS.balanceNegative,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: totals.single.balance >= 0
                    ? '0 20px 60px rgba(79, 172, 254, 0.4)'
                    : '0 20px 60px rgba(250, 112, 154, 0.4)',
                },
              }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                        Balance
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                        {totals.single.balance < 0 ? '-' : ''}{formatCurrency(Math.abs(totals.single.balance), totals.single.currency)}
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
            <Box display="flex" flexWrap="wrap" gap={3} mb={4}>
              {/* Income Card with Breakdown */}
              <Card sx={{ 
                flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' },
                minWidth: '280px',
                background: COLORS.gradients.income, 
                color: COLORS.text.primary,
                borderRadius: 3,
                boxShadow: BOX_SHADOWS.income,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: BOX_SHADOWS.incomeHover,
                },
              }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="body2" sx={{ color: COLORS.text.secondary, mb: 1, fontWeight: 500 }}>
                        Total Income
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" sx={{ color: COLORS.text.primary }}>
                        {formatCurrency(totals.converted.income, totals.converted.currency)}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(26, 32, 44, 0.1)', width: 48, height: 48, color: COLORS.text.primary }}>
                      <TrendingUp />
                    </Avatar>
                  </Box>
                  <Box sx={{ 
                    mt: 3, 
                    pt: 2, 
                    borderTop: '2px solid rgba(26, 32, 44, 0.1)',
                  }}>
                    <Typography variant="caption" sx={{ color: COLORS.text.tertiary, mb: 1.5, display: 'block', fontWeight: 500 }}>
                      By Currency:
                    </Typography>
                    {Object.entries(totals.byCurrency).map(([currency, data]) => (
                      <Box key={currency} display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2" sx={{ color: COLORS.text.secondary }}>
                          {currency}
                        </Typography>
                        <Typography variant="body2" fontWeight={500} sx={{ color: COLORS.text.primary }}>
                          {formatCurrency(data.income, currency)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>

              {/* Expense Card with Breakdown */}
              <Card sx={{ 
                flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' },
                minWidth: '280px',
                background: COLORS.gradients.expense, 
                color: COLORS.text.primary,
                borderRadius: 3,
                boxShadow: BOX_SHADOWS.expense,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: BOX_SHADOWS.expenseHover,
                },
              }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="body2" sx={{ color: COLORS.text.secondary, mb: 1, fontWeight: 500 }}>
                        Total Expenses
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" sx={{ color: COLORS.text.primary }}>
                        {formatCurrency(totals.converted.expense, totals.converted.currency)}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(26, 32, 44, 0.1)', width: 48, height: 48, color: COLORS.text.primary }}>
                      <TrendingDown />
                    </Avatar>
                  </Box>
                  <Box sx={{ 
                    mt: 3, 
                    pt: 2, 
                    borderTop: '1px solid rgba(255,255,255,0.2)',
                  }}>
                    <Typography variant="caption" sx={{ opacity: 0.8, mb: 1.5, display: 'block' }}>
                      By Currency:
                    </Typography>
                    {Object.entries(totals.byCurrency).map(([currency, data]) => (
                      <Box key={currency} display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          {currency}
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {formatCurrency(data.expense, currency)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>

              {/* Balance Card with Breakdown */}
              <Card sx={{ 
                flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' },
                minWidth: '280px',
                background: totals.converted.balance >= 0 
                  ? COLORS.gradients.balancePositive 
                  : COLORS.gradients.balanceNegative, 
                color: COLORS.text.primary,
                borderRadius: 3,
                boxShadow: totals.converted.balance >= 0
                  ? BOX_SHADOWS.balancePositive
                  : BOX_SHADOWS.balanceNegative,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: totals.converted.balance >= 0
                    ? BOX_SHADOWS.balancePositiveHover
                    : BOX_SHADOWS.balanceNegativeHover,
                },
              }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="body2" sx={{ color: COLORS.text.secondary, mb: 1, fontWeight: 500 }}>
                        Balance
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" sx={{ color: COLORS.text.primary }}>
                        {totals.converted.balance < 0 ? '-' : ''}{formatCurrency(Math.abs(totals.converted.balance), totals.converted.currency)}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(26, 32, 44, 0.1)', width: 48, height: 48, color: COLORS.text.primary }}>
                      <AccountBalance />
                    </Avatar>
                  </Box>
                  <Box sx={{ 
                    mt: 3, 
                    pt: 2, 
                    borderTop: '2px solid rgba(26, 32, 44, 0.1)',
                  }}>
                    <Typography variant="caption" sx={{ color: COLORS.text.tertiary, mb: 1.5, display: 'block', fontWeight: 500 }}>
                      By Currency:
                    </Typography>
                    {Object.entries(totals.byCurrency).map(([currency, data]) => (
                      <Box key={currency} display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2" sx={{ color: COLORS.text.secondary }}>
                          {currency}
                        </Typography>
                        <Typography variant="body2" fontWeight={500} sx={{ color: COLORS.text.primary }}>
                          {data.balance < 0 ? '-' : ''}{formatCurrency(Math.abs(data.balance), currency)} {data.balance >= 0 ? '↑' : '↓'}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </>
        )}

        {/* Filter Section */}
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <Button 
            variant="outlined"
            startIcon={<FilterList />} 
            onClick={() => setShowFilters(!showFilters)}
            size="small"
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              fontSize: '0.875rem',
              color: COLORS.text.secondary,
              borderColor: COLORS.background.border,
              '&:hover': {
                borderColor: COLORS.text.tertiary,
                bgcolor: COLORS.background.hover,
              },
            }}
          >
            Filters {hasActiveFilters && `(${Object.values({...filters, from: fromDate, to: toDate}).filter(v => v !== undefined && v !== null).length})`}
          </Button>
        </Box>

        <Collapse in={showFilters}>
          <FilterSection
            filters={filters}
            fromDate={fromDate}
            toDate={toDate}
            availableTypes={availableTypes}
            availableCurrencies={availableCurrencies}
            onFilterChange={handleFilterChange}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            onClose={() => setShowFilters(false)}
            hasActiveFilters={hasActiveFilters}
          />
        </Collapse>

        {/* Summary by Type - Pie Charts */}
        {summary && summary.expenses && summary.expenses.length > 0 && (
          <Box mb={4}>
            <Typography variant="h5" fontWeight="bold" mb={3} sx={{ color: COLORS.text.primary }}>
              Summary by Type
            </Typography>
            <Box display="flex" flexDirection={{ xs: 'column', lg: 'row' }} gap={3}>
              {/* Income Pie Chart */}
              {(() => {
                const incomeByType = summary.expenses
                  .filter(exp => exp.kind === 'income')
                  .reduce((acc, exp) => {
                    const rate = exchangeRates[exp.currency] || 1;
                    const targetRate = exchangeRates[summary.currency] || 1;
                    const convertedAmount = Math.abs(exp.amount) * rate / targetRate;
                    acc[exp.type] = (acc[exp.type] || 0) + convertedAmount;
                    return acc;
                  }, {} as Record<string, number>);
                
                return Object.keys(incomeByType).length > 0 ? (
                  <Paper sx={{ flex: 1, p: 3, borderRadius: 3, boxShadow: BOX_SHADOWS.card }}>
                    <Typography variant="h6" fontWeight="bold" mb={2} sx={{ color: COLORS.income.main }}>
                      Income by Type
                    </Typography>
                    <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2} alignItems="center">
                      <Box flex="1" display="flex" justifyContent="center" width="100%" minHeight={250}>
                        <PieChart
                          series={[
                            {
                              data: Object.entries(incomeByType)
                                .sort(([, a], [, b]) => b - a)
                                .map(([type, amount], index) => ({
                                  id: index,
                                  value: amount,
                                  label: type,
                                })),
                            },
                          ]}
                          height={250}
                        />
                      </Box>
                      <Box flex="1">
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', color: COLORS.text.primary }}>Type</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', color: COLORS.text.primary }}>Amount</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {Object.entries(incomeByType)
                                .sort(([, a], [, b]) => b - a)
                                .map(([type, amount]) => (
                                  <TableRow key={type} sx={{ '&:hover': { bgcolor: COLORS.background.hover } }}>
                                    <TableCell sx={{ color: COLORS.text.secondary, fontWeight: 500 }}>
                                      {type}
                                    </TableCell>
                                    <TableCell align="right" sx={{ color: COLORS.income.main, fontWeight: 600 }}>
                                      {formatCurrency(amount, summary.currency)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    </Box>
                  </Paper>
                ) : null;
              })()}

              {/* Expense Pie Chart */}
              {(() => {
                const expenseByType = summary.expenses
                  .filter(exp => exp.kind === 'expense')
                  .reduce((acc, exp) => {
                    const rate = exchangeRates[exp.currency] || 1;
                    const targetRate = exchangeRates[summary.currency] || 1;
                    const convertedAmount = Math.abs(exp.amount) * rate / targetRate;
                    acc[exp.type] = (acc[exp.type] || 0) + convertedAmount;
                    return acc;
                  }, {} as Record<string, number>);
                
                return Object.keys(expenseByType).length > 0 ? (
                  <Paper sx={{ flex: 1, p: 3, borderRadius: 3, boxShadow: BOX_SHADOWS.card }}>
                    <Typography variant="h6" fontWeight="bold" mb={2} sx={{ color: COLORS.expense.main }}>
                      Expense by Type
                    </Typography>
                    <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2} alignItems="center">
                      <Box flex="1" display="flex" justifyContent="center" width="100%" minHeight={250}>
                        <PieChart
                          series={[
                            {
                              data: Object.entries(expenseByType)
                                .sort(([, a], [, b]) => b - a)
                                .map(([type, amount], index) => ({
                                  id: index,
                                  value: amount,
                                  label: type,
                                })),
                            },
                          ]}
                          height={250}
                        />
                      </Box>
                      <Box flex="1">
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', color: COLORS.text.primary }}>Type</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', color: COLORS.text.primary }}>Amount</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {Object.entries(expenseByType)
                                .sort(([, a], [, b]) => b - a)
                                .map(([type, amount]) => (
                                  <TableRow key={type} sx={{ '&:hover': { bgcolor: COLORS.background.hover } }}>
                                    <TableCell sx={{ color: COLORS.text.secondary, fontWeight: 500 }}>
                                      {type}
                                    </TableCell>
                                    <TableCell align="right" sx={{ color: COLORS.expense.main, fontWeight: 600 }}>
                                      {formatCurrency(amount, summary.currency)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    </Box>
                  </Paper>
                ) : null;
              })()}
            </Box>
          </Box>
        )}

        {/* Grouped Summary - Table Format */}
        {summary?.groups && summary.groups.length > 0 && (
          <Box mt={4}>
            <Typography variant="h5" fontWeight="bold" mb={3} sx={{ color: COLORS.text.primary }}>
              Grouped Summary by {filters.group_by}
            </Typography>
            <TableContainer 
              component={Paper} 
              sx={{ 
                borderRadius: 3, 
                boxShadow: BOX_SHADOWS.card,
                overflow: 'hidden',
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: COLORS.gradients.primary }}>
                    <TableCell sx={{ fontWeight: 'bold', color: COLORS.text.primary }}>Period</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: COLORS.text.primary }}>Income</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: COLORS.text.primary }}>Expense</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: COLORS.text.primary }}>Balance</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: COLORS.text.primary }}>Types</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {summary.groups.map((group) => (
                    <TableRow 
                      key={group.key}
                      sx={{ 
                        '&:hover': { bgcolor: COLORS.background.hover },
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      <TableCell sx={{ color: COLORS.text.primary, fontWeight: 600 }}>
                        {group.label}
                      </TableCell>
                      <TableCell align="right" sx={{ color: COLORS.income.main, fontWeight: 600 }}>
                        {formatCurrency(group.income, summary.currency)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: COLORS.expense.main, fontWeight: 600 }}>
                        {formatCurrency(group.expense, summary.currency)}
                      </TableCell>
                      <TableCell 
                        align="right" 
                        sx={{ 
                          color: group.balance >= 0 ? COLORS.income.main : COLORS.expense.main,
                          fontWeight: 600,
                        }}
                      >
                        {group.balance < 0 ? '-' : ''}{formatCurrency(Math.abs(group.balance), summary.currency)} {group.balance >= 0 ? '↑' : '↓'}
                      </TableCell>
                      <TableCell sx={{ color: COLORS.text.secondary, fontSize: '0.875rem' }}>
                        {Object.keys(group.total_by_type).length > 0 ? (
                          Object.entries(group.total_by_type)
                            .sort(([, a], [, b]) => (b as number) - (a as number))
                            .map(([type, amount]) => (
                              <Box key={type} component="span" sx={{ display: 'block', mb: 0.5 }}>
                                {type}: {formatCurrency(amount, summary.currency)}
                              </Box>
                            ))
                        ) : (
                          <Box component="span" sx={{ color: COLORS.text.tertiary }}>-</Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Summary;
