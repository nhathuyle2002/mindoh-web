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
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { format, startOfMonth, endOfMonth, subMonths, subDays } from 'date-fns';
import { 
  TrendingUp, 
  TrendingDown, 
  AccountBalance,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { expenseService } from '../services/expenseService';
import type { SummaryFilter, GroupsFilter, ExpenseSummary as ExpenseSummaryType, ExpenseGroup } from '../services/expenseService';
import { PieChart } from '@mui/x-charts/PieChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { CURRENCY_SYMBOLS } from '../constants/currencies';
import { COLORS, BOX_SHADOWS } from '../constants/colors';

type DatePreset = 'all' | 'last_7d' | 'this_month' | 'last_3m' | 'last_6m' | 'last_12m' | 'custom';

const Summary: React.FC = () => {
  const [summary, setSummary] = useState<ExpenseSummaryType | null>(null);
  const [groups, setGroups] = useState<ExpenseGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>(['VND', 'USD']);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [baseCurrency, setBaseCurrency] = useState<string>('VND');

  // Filter states
  const [originalCurrency, setOriginalCurrency] = useState<string>('VND');
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [showByCurrency, setShowByCurrency] = useState(true);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const isCustom = datePreset === 'custom';
  const [groupBy, setGroupBy] = useState<'DAY' | 'WEEK' | 'MONTH'>('MONTH');

  const fetchSummary = async (filterParams?: SummaryFilter) => {
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

  const fetchGroups = async (filterParams: GroupsFilter) => {
    try {
      const result = await expenseService.getGroups(filterParams);
      setGroups(result.groups);
    } catch {
      setGroups([]);
    }
  };

  const buildAndFetch = (params: { from?: Date | null; to?: Date | null; currency?: string; group_by?: string }) => {
    const cleanFilters: SummaryFilter = {};
    if (params.currency) cleanFilters.original_currency = params.currency;
    if (params.from) cleanFilters.from = format(params.from, 'yyyy-MM-dd');
    if (params.to) cleanFilters.to = format(params.to, 'yyyy-MM-dd');
    fetchSummary(cleanFilters);
    if (params.group_by) {
      const gf: GroupsFilter = {
        group_by: params.group_by,
        original_currency: params.currency,
        from: params.from ? format(params.from, 'yyyy-MM-dd') : undefined,
        to: params.to ? format(params.to, 'yyyy-MM-dd') : undefined,
      };
      fetchGroups(gf);
    }
  };

  const getPresetDates = (preset: DatePreset): { from: Date; to: Date } | null => {
    const now = new Date();
    switch (preset) {
      case 'all':      return null;
      case 'last_7d':  return { from: subDays(now, 6), to: now };
      case 'this_month': return { from: startOfMonth(now), to: endOfMonth(now) };
      case 'last_3m':  return { from: startOfMonth(subMonths(now, 2)), to: endOfMonth(now) };
      case 'last_6m':  return { from: startOfMonth(subMonths(now, 5)), to: endOfMonth(now) };
      case 'last_12m': return { from: startOfMonth(subMonths(now, 11)), to: endOfMonth(now) };
      default:         return null;
    }
  };

  const defaultGroupByForPreset = (preset: DatePreset): 'DAY' | 'WEEK' | 'MONTH' => {
    switch (preset) {
      case 'all':
      case 'last_3m':
      case 'last_6m':
      case 'last_12m': return 'MONTH';
      default:         return 'DAY';
    }
  };

  useEffect(() => {
    buildAndFetch({ from: null, to: null, currency: originalCurrency, group_by: 'MONTH' });
    expenseService.getAvailableCurrencies().then(currencies => setAvailableCurrencies(currencies)).catch(() => {});
    expenseService.getExchangeRates().then(({ base_currency, rates }) => { setBaseCurrency(base_currency); setExchangeRates(rates); }).catch(() => {});
    // eslint-disable-next-line
  }, []);

  const handlePresetChange = (_: React.MouseEvent<HTMLElement>, preset: DatePreset | null) => {
    if (!preset) return;
    setDatePreset(preset);
    const newGroupBy = defaultGroupByForPreset(preset);
    setGroupBy(newGroupBy);
    if (preset === 'all') {
      setFromDate(null);
      setToDate(null);
      buildAndFetch({ from: null, to: null, currency: originalCurrency, group_by: newGroupBy });
      return;
    }
    const dates = getPresetDates(preset);
    if (dates) {
      setFromDate(dates.from);
      setToDate(dates.to);
      buildAndFetch({ from: dates.from, to: dates.to, currency: originalCurrency, group_by: newGroupBy });
    }
  };

  const handleCustomFromChange = (date: Date | null) => {
    setFromDate(date);
    setDatePreset('custom');
    buildAndFetch({ from: date, to: toDate, currency: originalCurrency, group_by: groupBy });
  };

  const handleCustomToChange = (date: Date | null) => {
    setToDate(date);
    setDatePreset('custom');
    buildAndFetch({ from: fromDate, to: date, currency: originalCurrency, group_by: groupBy });
  };

  const handleCurrencyChange = (currency: string) => {
    setOriginalCurrency(currency);
    buildAndFetch({ from: fromDate, to: toDate, currency, group_by: groupBy });
  };

  const handleGroupByChange = (_: React.MouseEvent<HTMLElement>, val: 'DAY' | 'WEEK' | 'MONTH' | null) => {
    if (!val) return;
    setGroupBy(val);
    buildAndFetch({ from: fromDate, to: toDate, currency: originalCurrency, group_by: val });
  };

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
      const allCurrencies = availableCurrencies.reduce((acc, cur) => {
        acc[cur] = { income: 0, expense: 0, balance: 0 };
        return acc;
      }, {} as Record<string, { income: number; expense: number; balance: number }>);
      Object.entries(summary.by_currency).forEach(([cur, data]) => {
        allCurrencies[cur] = {
          income: data.total_income,
          expense: data.total_expense,
          balance: data.total_balance,
        };
      });
      return {
        mode: 'breakdown' as const,
        converted: {
          currency: summary.currency,
          income: summary.total_income,
          expense: summary.total_expense,
          balance: summary.total_balance,
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
        balance: summary.total_balance,
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
      <Container maxWidth={false} disableGutters sx={{ mt: { xs: 1, md: 4 }, mb: 4, flexGrow: 1, px: { xs: 1.5, sm: 2, md: 4 } }}>
        {/* Filter Bar - Always Visible */}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Paper sx={{ p: { xs: 1.5, md: 2 }, mb: 3, borderRadius: 3, boxShadow: BOX_SHADOWS.card }}>
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="flex-start" gap={2}>
              {/* Date presets + custom range */}
              <Box display="flex" flexDirection="column" gap={1.5} width={{ xs: '100%', md: 'auto' }}>
                <ToggleButtonGroup
                  value={datePreset}
                  exclusive
                  onChange={handlePresetChange}
                  size="small"
                  sx={{ flexWrap: 'wrap', gap: 0.5 }}
                >
                  {([
                    ['all',        'All'],
                    ['last_7d',    'Last 7d'],
                    ['this_month', 'This Month'],
                    ['last_3m',   'Last 3M'],
                    ['last_6m',   'Last 6M'],
                    ['last_12m',  'Last 12M'],
                    ['custom',     'Custom'],
                  ] as const).map(([v, label]) => (
                    <ToggleButton key={v} value={v} sx={{ minWidth: { xs: 70, md: 90 }, fontSize: { xs: '0.72rem', md: '0.8125rem' }, px: { xs: 1, md: 1.5 } }}>
                      {label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
                <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
                  <DatePicker
                    label="From"
                    value={fromDate}
                    onChange={handleCustomFromChange}
                    disabled={!isCustom}
                    slotProps={{ textField: { size: 'small', sx: { width: { xs: '140px', md: 'auto' } } } }}
                  />
                  <Typography variant="body2" sx={{ color: COLORS.text.tertiary }}>→</Typography>
                  <DatePicker
                    label="To"
                    value={toDate}
                    onChange={handleCustomToChange}
                    disabled={!isCustom}
                    slotProps={{ textField: { size: 'small', sx: { width: { xs: '140px', md: 'auto' } } } }}
                  />
                </Box>
              </Box>
              {/* Currency + group-by controls */}
              <Box display="flex" flexDirection={{ xs: 'row', md: 'column' }} alignItems={{ xs: 'center', md: 'flex-end' }} gap={1.5} flexWrap="wrap">
                {/* By Currency toggle + Currency selector */}
                <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                  <FormControlLabel
                    control={<Switch checked={showByCurrency} onChange={(e) => setShowByCurrency(e.target.checked)} size="small" />}
                    label={<Typography variant="body2" sx={{ color: COLORS.text.secondary }}>By Currency</Typography>}
                  />
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      value={originalCurrency}
                      label="Currency"
                      onChange={(e) => handleCurrencyChange(e.target.value)}
                    >
                      {availableCurrencies.map((c) => (
                        <MenuItem key={c} value={c}>{c}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                {/* Group by toggle */}
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="caption" sx={{ color: COLORS.text.tertiary, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    Group by
                  </Typography>
                  <ToggleButtonGroup
                    value={groupBy}
                    exclusive
                    onChange={handleGroupByChange}
                    size="small"
                  >
                    {(['DAY', 'WEEK', 'MONTH'] as const).map((v) => (
                      <ToggleButton key={v} value={v} sx={{ minWidth: { xs: 52, md: 72 }, fontSize: { xs: '0.72rem', md: '0.8125rem' } }}>
                        {v.charAt(0) + v.slice(1).toLowerCase()}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Box>
              </Box>
            </Box>
          </Paper>
        </LocalizationProvider>

        {/* Exchange Rates - Top Right */}
        {Object.keys(exchangeRates).length > 0 && (
          <Box display="flex" flexWrap="wrap" justifyContent="flex-end" mb={2} gap={0.5}>
            <Typography variant="caption" sx={{ color: COLORS.text.tertiary, mr: 0.5 }}>
              Rates → {baseCurrency}:
            </Typography>
            {Object.entries(exchangeRates)
              .filter(([curr]) => curr !== baseCurrency)
              .map(([currency, rate]) => (
                <Typography
                  key={currency}
                  component="span"
                  variant="caption"
                  sx={{ color: COLORS.text.secondary, mr: 1.5 }}
                >
                  1 {currency} = {rate.toLocaleString()} {CURRENCY_SYMBOLS[baseCurrency] || baseCurrency}
                </Typography>
              ))}
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Stats Cards - Single Mode */}
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
                border: '1px solid rgba(255,255,255,0.35)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 20px 60px rgba(102,126,234,0.4)' },
              }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>Total Income</Typography>
                      <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                        {formatCurrency(totals.single.income, totals.single.currency)}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}><TrendingUp /></Avatar>
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
                border: '1px solid rgba(255,255,255,0.35)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 20px 60px rgba(240,147,251,0.4)' },
              }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>Total Expense</Typography>
                      <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                        {formatCurrency(totals.single.expense, totals.single.currency)}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}><TrendingDown /></Avatar>
                  </Box>
                </CardContent>
              </Card>

              <Card sx={{ 
                flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 11px)' },
                minWidth: '250px',
                background: totals.single.balance >= 0 ? COLORS.gradients.balancePositive : COLORS.gradients.balanceNegative,
                color: 'white',
                borderRadius: 4,
                boxShadow: totals.single.balance >= 0 ? BOX_SHADOWS.balancePositive : BOX_SHADOWS.balanceNegative,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: totals.single.balance >= 0 ? '0 20px 60px rgba(79,172,254,0.4)' : '0 20px 60px rgba(250,112,154,0.4)',
                },
              }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>Total Balance</Typography>
                      <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                        {totals.single.balance < 0 ? '-' : ''}{formatCurrency(Math.abs(totals.single.balance), totals.single.currency)}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}><AccountBalance /></Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}

        {/* Stats Cards - Breakdown Mode (multi-currency) */}
        {totals.mode === 'breakdown' && totals.converted && (
          <Box display="flex" flexWrap="wrap" gap={3} mb={4}>
            {/* Income Card with Breakdown */}
            <Card sx={{ 
              flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' },
              minWidth: '280px',
              background: COLORS.gradients.income,
              color: COLORS.text.primary,
              borderRadius: 3,
              boxShadow: BOX_SHADOWS.income,
              border: '1px solid rgba(255,255,255,0.25)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: BOX_SHADOWS.incomeHover },
            }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Typography variant="body2" sx={{ color: COLORS.text.secondary, mb: 1, fontWeight: 500 }}>Total Income</Typography>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: COLORS.text.primary }}>
                      {formatCurrency(totals.converted.income, totals.converted.currency)}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(26, 32, 44, 0.1)', width: 48, height: 48, color: COLORS.text.primary }}>
                    <TrendingUp />
                  </Avatar>
                </Box>
                {showByCurrency && (
                <Box sx={{ mt: 3, pt: 2, borderTop: '2px solid rgba(26, 32, 44, 0.1)' }}>
                  <Typography variant="caption" sx={{ color: COLORS.text.tertiary, mb: 1.5, display: 'block', fontWeight: 500 }}>By Currency:</Typography>
                  {Object.entries(totals.byCurrency).map(([cur, data]) => (
                    <Box key={cur} display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2" sx={{ color: COLORS.text.secondary }}>{cur}</Typography>
                      <Typography variant="body2" fontWeight={500} sx={{ color: COLORS.text.primary }}>
                        {formatCurrency(data.income, cur)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                )}
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
              border: '1px solid rgba(255,255,255,0.25)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: BOX_SHADOWS.expenseHover },
            }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Typography variant="body2" sx={{ color: COLORS.text.secondary, mb: 1, fontWeight: 500 }}>Total Expense</Typography>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: COLORS.text.primary }}>
                      {formatCurrency(totals.converted.expense, totals.converted.currency)}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(26, 32, 44, 0.1)', width: 48, height: 48, color: COLORS.text.primary }}>
                    <TrendingDown />
                  </Avatar>
                </Box>
                {showByCurrency && (
                <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                  <Typography variant="caption" sx={{ opacity: 0.8, mb: 1.5, display: 'block' }}>By Currency:</Typography>
                  {Object.entries(totals.byCurrency).map(([cur, data]) => (
                    <Box key={cur} display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>{cur}</Typography>
                      <Typography variant="body2" fontWeight={500}>{formatCurrency(data.expense, cur)}</Typography>
                    </Box>
                  ))}
                </Box>
                )}
              </CardContent>
            </Card>

            {/* Balance Card with Breakdown */}
            <Card sx={{ 
              flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' },
              minWidth: '280px',
              background: totals.converted.balance >= 0 ? COLORS.gradients.balancePositive : COLORS.gradients.balanceNegative,
              color: COLORS.text.primary,
              borderRadius: 3,
              boxShadow: totals.converted.balance >= 0 ? BOX_SHADOWS.balancePositive : BOX_SHADOWS.balanceNegative,
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: totals.converted.balance >= 0 ? BOX_SHADOWS.balancePositiveHover : BOX_SHADOWS.balanceNegativeHover,
              },
            }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Typography variant="body2" sx={{ color: COLORS.text.secondary, mb: 1, fontWeight: 500 }}>Total Balance</Typography>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: COLORS.text.primary }}>
                      {totals.converted.balance < 0 ? '-' : ''}{formatCurrency(Math.abs(totals.converted.balance), totals.converted.currency)}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(26, 32, 44, 0.1)', width: 48, height: 48, color: COLORS.text.primary }}>
                    <AccountBalance />
                  </Avatar>
                </Box>
                {showByCurrency && (
                <Box sx={{ mt: 3, pt: 2, borderTop: '2px solid rgba(26, 32, 44, 0.1)' }}>
                  <Typography variant="caption" sx={{ color: COLORS.text.tertiary, mb: 1.5, display: 'block', fontWeight: 500 }}>By Currency:</Typography>
                  {Object.entries(totals.byCurrency).map(([cur, data]) => (
                    <Box key={cur} display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2" sx={{ color: COLORS.text.secondary }}>{cur}</Typography>
                      <Typography variant="body2" fontWeight={500} sx={{ color: COLORS.text.primary }}>
                        {data.balance < 0 ? '-' : ''}{formatCurrency(Math.abs(data.balance), cur)} {data.balance >= 0 ? '↑' : '↓'}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Pie Charts */}
        {summary && (
          Object.keys(summary.total_by_type_income ?? {}).length > 0 ||
          Object.keys(summary.total_by_type_expense ?? {}).length > 0
        ) && (
          <Box mb={4}>
            <Box display="flex" flexDirection={{ xs: 'column', lg: 'row' }} gap={3}>
              {/* Income Pie Chart */}
              {Object.keys(summary?.total_by_type_income ?? {}).length > 0 && (
                <Paper sx={{ flex: 1, p: 3, borderRadius: 3, boxShadow: BOX_SHADOWS.card }}>
                  <Typography variant="h6" fontWeight="bold" mb={2} sx={{ color: COLORS.income.main }}>
                    Income
                  </Typography>
                  <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2} alignItems="center">
                    <Box flex="1" display="flex" justifyContent="center" width="100%" minHeight={250}>
                      <PieChart
                        series={[{
                          data: Object.entries(summary.total_by_type_income)
                            .sort(([, a], [, b]) => b - a)
                            .map(([type, amount], index) => ({ id: index, value: amount, label: type })),
                        }]}
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
                            {Object.entries(summary.total_by_type_income)
                              .sort(([, a], [, b]) => b - a)
                              .map(([type, amount]) => (
                                <TableRow key={type} sx={{ '&:hover': { bgcolor: COLORS.background.hover } }}>
                                  <TableCell sx={{ color: COLORS.text.secondary, fontWeight: 500 }}>{type}</TableCell>
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
              )}

              {/* Expense Pie Chart */}
              {Object.keys(summary?.total_by_type_expense ?? {}).length > 0 && (
                <Paper sx={{ flex: 1, p: 3, borderRadius: 3, boxShadow: BOX_SHADOWS.card }}>
                  <Typography variant="h6" fontWeight="bold" mb={2} sx={{ color: COLORS.expense.main }}>
                    Expense
                  </Typography>
                  <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2} alignItems="center">
                    <Box flex="1" display="flex" justifyContent="center" width="100%" minHeight={250}>
                      <PieChart
                        series={[{
                          data: Object.entries(summary.total_by_type_expense)
                            .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
                            .map(([type, amount], index) => ({ id: index, value: Math.abs(amount), label: type })),
                        }]}
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
                            {Object.entries(summary.total_by_type_expense)
                              .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
                              .map(([type, amount]) => (
                                <TableRow key={type} sx={{ '&:hover': { bgcolor: COLORS.background.hover } }}>
                                  <TableCell sx={{ color: COLORS.text.secondary, fontWeight: 500 }}>{type}</TableCell>
                                  <TableCell align="right" sx={{ color: COLORS.expense.main, fontWeight: 600 }}>
                                    {formatCurrency(Math.abs(amount), summary.currency)}
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Box>
                </Paper>
              )}
            </Box>
          </Box>
        )}

        {/* Line Chart */}
        {groups.length > 0 && (
          <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: BOX_SHADOWS.card }}>
            <Typography variant="h6" fontWeight={700} mb={2} sx={{ color: COLORS.text.primary }}>
              Trend ({summary?.currency})
            </Typography>
            <LineChart
              xAxis={[{ data: groups.map(g => g.label), scaleType: 'point' }]}
              series={[
                { data: groups.map(g => g.income), label: 'Income', color: '#28C76F' },
                { data: groups.map(g => Math.abs(g.expense)), label: 'Expense', color: '#EA5455' },
                { data: groups.map(g => g.balance), label: 'Balance', color: '#4F9CFE' },
              ]}
              height={300}
              margin={{ left: 70 }}
            />
          </Paper>
        )}

        {/* Grouped table */}
        {groups.length > 0 && (
          <Box mt={2} mb={4}>
            <TableContainer
              component={Paper}
              sx={{ borderRadius: 3, boxShadow: BOX_SHADOWS.card, overflowX: 'auto' }}
            >
              <Table sx={{ minWidth: 560 }}>
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
                  {groups.map((group) => (
                    <TableRow key={group.key} sx={{ '&:hover': { bgcolor: COLORS.background.hover }, transition: 'background-color 0.2s ease' }}>
                      <TableCell sx={{ color: COLORS.text.primary, fontWeight: 600 }}>{group.label}</TableCell>
                      <TableCell align="right" sx={{ color: COLORS.income.main, fontWeight: 600 }}>
                        {formatCurrency(group.income, summary?.currency ?? '')}
                      </TableCell>
                      <TableCell align="right" sx={{ color: COLORS.expense.main, fontWeight: 600 }}>
                        {formatCurrency(group.expense, summary?.currency ?? '')}
                      </TableCell>
                      <TableCell align="right" sx={{ color: group.balance >= 0 ? COLORS.income.main : COLORS.expense.main, fontWeight: 600 }}>
                        {group.balance < 0 ? '-' : ''}{formatCurrency(Math.abs(group.balance), summary?.currency ?? '')} {group.balance >= 0 ? '↑' : '↓'}
                      </TableCell>
                      <TableCell sx={{ color: COLORS.text.secondary, fontSize: '0.8rem', maxWidth: 180 }}>
                        {Object.keys(group.total_by_type).length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {Object.entries(group.total_by_type)
                              .sort(([, a], [, b]) => (b as number) - (a as number))
                              .map(([type, amount]) => (
                                <Box key={type} component="span" sx={{ px: 0.75, py: 0.25, borderRadius: 1, bgcolor: 'action.hover', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                                  {type}: {formatCurrency(amount, summary?.currency ?? '')}
                                </Box>
                              ))}
                          </Box>
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
