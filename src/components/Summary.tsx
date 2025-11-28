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
} from '@mui/material';
import { format } from 'date-fns';
import { 
  FilterList, 
  TrendingUp, 
  TrendingDown, 
  AccountBalance,
} from '@mui/icons-material';
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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Container maxWidth={false} disableGutters sx={{ mt: 4, mb: 4, flexGrow: 1, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Exchange Rates Info */}
        {totals.mode === 'breakdown' && Object.keys(exchangeRates).length > 0 && (
          <Box mb={3}>
            <Paper sx={{ 
              p: 3, 
              background: COLORS.gradients.primary,
              borderRadius: 3,
              boxShadow: BOX_SHADOWS.card,
            }}>
              <Typography variant="body1" fontWeight={600} gutterBottom sx={{ color: COLORS.text.secondary }}>
                Exchange Rates to {baseCurrency}:
              </Typography>
              <Box display="flex" gap={3} flexWrap="wrap" mt={1}>
                {Object.entries(exchangeRates)
                  .filter(([curr]) => curr !== baseCurrency)
                  .map(([currency, rate]) => (
                    <Box 
                      key={currency} 
                      sx={{ 
                        bgcolor: COLORS.background.paper,
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        boxShadow: BOX_SHADOWS.small,
                      }}
                    >
                      <Typography variant="body2" sx={{ color: COLORS.text.tertiary, fontWeight: 500 }}>
                        1 {currency} = {rate.toLocaleString()} {CURRENCY_SYMBOLS[baseCurrency] || baseCurrency}
                      </Typography>
                    </Box>
                  ))}
              </Box>
            </Paper>
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
                        {formatCurrency(Math.abs(totals.single.balance), totals.single.currency)}
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
                        {formatCurrency(Math.abs(totals.converted.balance), totals.converted.currency)}
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
                          {formatCurrency(Math.abs(data.balance), currency)} {data.balance >= 0 ? '↑' : '↓'}
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

        {/* Grouped Summary */}
        {summary?.groups && summary.groups.length > 0 && (
          <Box mt={4}>
            <Typography variant="h5" fontWeight="bold" mb={3} sx={{ color: COLORS.text.primary }}>
              Grouped Summary ({filters.group_by})
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              {summary.groups.map((group) => (
                <Paper
                  key={group.key}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    boxShadow: BOX_SHADOWS.card,
                    background: COLORS.gradients.primary,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: BOX_SHADOWS.cardHover,
                    },
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" mb={2} sx={{ color: COLORS.text.primary }}>
                    {group.label}
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={3}>
                    <Box flex="1 1 200px">
                      <Typography variant="body2" sx={{ color: COLORS.text.tertiary, mb: 0.5 }}>
                        Income
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: COLORS.income.main }}>
                        {formatCurrency(group.income, summary.currency)}
                      </Typography>
                    </Box>
                    <Box flex="1 1 200px">
                      <Typography variant="body2" sx={{ color: COLORS.text.tertiary, mb: 0.5 }}>
                        Expense
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: COLORS.expense.main }}>
                        {formatCurrency(group.expense, summary.currency)}
                      </Typography>
                    </Box>
                    <Box flex="1 1 200px">
                      <Typography variant="body2" sx={{ color: COLORS.text.tertiary, mb: 0.5 }}>
                        Balance
                      </Typography>
                      <Typography 
                        variant="h6" 
                        fontWeight="bold" 
                        sx={{ 
                          color: group.balance >= 0 ? COLORS.income.main : COLORS.expense.main 
                        }}
                      >
                        {formatCurrency(Math.abs(group.balance), summary.currency)} {group.balance >= 0 ? '↑' : '↓'}
                      </Typography>
                    </Box>
                  </Box>
                  {Object.keys(group.total_by_type).length > 0 && (
                    <Box mt={2} pt={2} sx={{ borderTop: `1px solid ${COLORS.background.border}` }}>
                      <Typography variant="body2" sx={{ color: COLORS.text.tertiary, mb: 1, fontWeight: 500 }}>
                        By Type:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={2}>
                        {Object.entries(group.total_by_type).map(([type, amount]) => (
                          <Box key={type} sx={{ flex: '0 1 auto' }}>
                            <Typography variant="body2" sx={{ color: COLORS.text.secondary }}>
                              {type}: {formatCurrency(amount, summary.currency)}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Paper>
              ))}
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Summary;
