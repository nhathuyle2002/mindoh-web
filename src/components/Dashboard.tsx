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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Container,
} from '@mui/material';
import { Add, Edit, Delete, WarningAmber, ArrowUpward, ArrowDownward, UnfoldMore } from '@mui/icons-material';
import { expenseService } from '../services/expenseService';
import type { ExpenseFilter } from '../services/expenseService';
import type { Expense } from '../types/api';
import AddExpense from './AddExpense';
import { CURRENCY_SYMBOLS } from '../constants/currencies';
import { COLORS } from '../constants/colors';
import FilterSection from '../common/FilterSection';
import { formatDateForDisplay, formatDateToYYYYMMDD } from '../common/utils/dateUtils';
import type { SummaryFilter } from '../services/expenseService';

const Dashboard: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(0); // 0-indexed for MUI
  const [rowsPerPage, setRowsPerPage] = useState<number>(25);
  const [incomeCount, setIncomeCount] = useState<number>(0);
  const [expenseCount, setExpenseCount] = useState<number>(0);
  const [byCurrency, setByCurrency] = useState<Record<string, { total_income: number; total_expense: number; total_balance: number }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>(['VND', 'USD']);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Sort state: null = no custom sort (uses default date desc)
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(null);

  // Filter states
  const [filters, setFilters] = useState<ExpenseFilter>({
    kind: undefined,
    types: undefined,
    currencies: undefined,
    from: undefined,
    to: undefined,
  });

  // Date filter states (stored as Date objects for DatePicker)
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  // Build clean filter objects from current state
  const buildCleanFilters = (): ExpenseFilter => {
    const f: ExpenseFilter = {};
    if (filters.kind) f.kind = filters.kind;
    if (filters.types && filters.types.length > 0) f.types = filters.types;
    if (filters.currencies && filters.currencies.length > 0) f.currencies = filters.currencies;
    if (fromDate) f.from = formatDateToYYYYMMDD(fromDate);
    if (toDate) f.to = formatDateToYYYYMMDD(toDate);
    return f;
  };

  const buildSummaryFilter = (clean: ExpenseFilter): SummaryFilter => ({
    kind: clean.kind,
    types: clean.types,
    currencies: clean.currencies,
    from: clean.from,
    to: clean.to,
  });

  // fetchRows: only fetches paged data — called on every page/sort/filter change
  const fetchRows = async (
    filterParams: ExpenseFilter,
    col: string | null,
    dir: 'asc' | 'desc' | null,
    pg: number,
    rpp: number,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const params: ExpenseFilter = { ...filterParams };
      if (col && dir) {
        params.order_by = col as ExpenseFilter['order_by'];
        params.order_dir = dir;
      }
      params.page = pg + 1; // backend is 1-indexed
      params.page_size = rpp;
      const result = await expenseService.getExpenses(params);
      setExpenses(result.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch expenses');
      setExpenses([]);
    }
    setLoading(false);
  };

  // fetchSummary: fetches aggregated totals — called only when filters change, not on page nav
  const fetchSummary = async (sf: SummaryFilter) => {
    try {
      const result = await expenseService.getSummary(sf);
      setTotal((result.income_count ?? 0) + (result.expense_count ?? 0));
      setIncomeCount(result.income_count ?? 0);
      setExpenseCount(result.expense_count ?? 0);
      setByCurrency((result.by_currency as any) ?? {});
    } catch {
      setTotal(0); setIncomeCount(0); setExpenseCount(0); setByCurrency({});
    }
  };

  // fetchAll: rows + summary together (filter/sort change)
  const fetchAll = (
    filterParams: ExpenseFilter,
    col: string | null,
    dir: 'asc' | 'desc' | null,
    pg: number,
    rpp: number,
  ) => {
    fetchRows(filterParams, col, dir, pg, rpp);
    fetchSummary(buildSummaryFilter(filterParams));
  };

  useEffect(() => {
    const clean = buildCleanFilters();
    fetchRows(clean, sortCol, sortDir, 0, rowsPerPage);
    fetchSummary(buildSummaryFilter(clean));
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

  const handleFilterChange = (field: string, value: any) => {
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
    setPage(0);
    const clean = buildCleanFilters();
    fetchAll(clean, sortCol, sortDir, 0, rowsPerPage);
  };

  const handleClearFilters = () => {
    setFilters({ kind: undefined, types: undefined, currencies: undefined, from: undefined, to: undefined });
    setFromDate(null);
    setToDate(null);
    setPage(0);
    fetchAll({}, sortCol, sortDir, 0, rowsPerPage);
  };

  // 3-state sort: first click → desc, second → asc, third → remove
  const handleSort = (col: string) => {
    let newCol: string | null;
    let newDir: 'asc' | 'desc' | null;
    if (sortCol !== col) {
      newCol = col; newDir = 'desc';
    } else if (sortDir === 'desc') {
      newCol = col; newDir = 'asc';
    } else {
      newCol = null; newDir = null;
    }
    setSortCol(newCol);
    setSortDir(newDir);
    setPage(0);
    // Sort doesn't change which records match — only rows need refresh
    fetchRows(buildCleanFilters(), newCol, newDir, 0, rowsPerPage);
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortCol !== col) return <UnfoldMore fontSize="small" sx={{ opacity: 0.3, ml: 0.5, verticalAlign: 'middle' }} />;
    if (sortDir === 'desc') return <ArrowDownward fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle', color: 'primary.main' }} />;
    return <ArrowUpward fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle', color: 'primary.main' }} />;
  };

  const handleDeleteExpense = async (id: number) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirmId === null) return;
    try {
      await expenseService.deleteExpense(deleteConfirmId);
      const clean = buildCleanFilters();
      fetchAll(clean, sortCol, sortDir, page, rowsPerPage);
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

  const hasActiveFilters = !!(filters.kind || (filters.types && filters.types.length > 0) || (filters.currencies && filters.currencies.length > 0) || fromDate || toDate);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
    // Pure page navigation — only fetch rows, totals haven't changed
    fetchRows(buildCleanFilters(), sortCol, sortDir, newPage, rowsPerPage);
  };

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRpp = parseInt(e.target.value, 10);
    setRowsPerPage(newRpp);
    setPage(0);
    fetchRows(buildCleanFilters(), sortCol, sortDir, 0, newRpp);
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
            onExpenseAdded={() => { handleClose(); fetchAll(buildCleanFilters(), sortCol, sortDir, page, rowsPerPage); }}
            onClose={handleClose}
          />
        </DialogContent>
      </Dialog>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} variant="filled">{error}</Alert>
      )}

      {/* Summary Section removed - use the Summary page for totals */}

      {/* Filter Section - always visible, above stats */}
      <Paper sx={{ mb: 2, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid', borderColor: 'divider' }} elevation={0}>
        <FilterSection
          filters={filters}
          fromDate={fromDate}
          toDate={toDate}
          availableTypes={availableTypes}
          availableCurrencies={availableCurrencies}
          onFilterChange={handleFilterChange}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
          showGroupBy={false}
          showOriginalCurrency={false}
        />
      </Paper>



      {!loading && Object.keys(byCurrency).length > 0 && (
        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
          {Object.entries(byCurrency).map(([cur, cs]) => {
            const symbol = CURRENCY_SYMBOLS[cur] || cur;
            const fmt = (v: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: cur === 'VND' ? 0 : 2 }).format(Math.abs(v));
            const positive = cs.total_balance >= 0;
            return (
              <Box key={cur} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.5, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: COLORS.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.04em', mr: 0.5 }}>{cur}</Typography>
                <Typography variant="caption" sx={{ color: COLORS.income.main }}>↑ {fmt(cs.total_income)} {symbol}</Typography>
                <Typography variant="caption" sx={{ color: COLORS.text.tertiary }}>·</Typography>
                <Typography variant="caption" sx={{ color: COLORS.expense.main }}>↓ {fmt(cs.total_expense)} {symbol}</Typography>
                <Typography variant="caption" sx={{ color: COLORS.text.tertiary }}>·</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: positive ? COLORS.income.main : COLORS.expense.main }}>
                  = {positive ? '+' : '-'}{fmt(cs.total_balance)} {symbol}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}

      <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }} elevation={2}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Box display="flex" alignItems="baseline" gap={1.5}>
            <Typography variant="h5" fontWeight={600}>
              Transactions
            </Typography>
            {!loading && (
              <Typography variant="body2" sx={{ color: COLORS.text.tertiary }}>
                {total} {total === 1 ? 'record' : 'records'}
                {(incomeCount > 0 || expenseCount > 0) && (
                  <>
                    {' '}(
                    <Box component="span" sx={{ color: COLORS.income.main }}>{incomeCount} income</Box>
                    {', '}
                    <Box component="span" sx={{ color: COLORS.expense.main }}>{expenseCount} expense</Box>
                    )
                  </>
                )}
              </Typography>
            )}
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={handleOpen} size="small"
            sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #28C76F 100%)', boxShadow: '0 4px 12px rgba(40,199,111,0.3)', '&:hover': { boxShadow: '0 6px 16px rgba(40,199,111,0.4)', transform: 'translateY(-1px)' }, transition: 'all 0.2s ease' }}>
            Add Transaction
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {loading || expenses.length > 0 ? (
          <>
          <TableContainer>
            <Table sx={{ minWidth: 650 }} size="medium">
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('date')}>
                    Date <SortIcon col="date" />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('kind')}>
                    Kind <SortIcon col="kind" />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('amount')}>
                    Amount <SortIcon col="amount" />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('type')}>
                    Type <SortIcon col="type" />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('currency')}>
                    Resource <SortIcon col="currency" />
                  </TableCell>
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
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50, 100]}
            sx={{ borderTop: '1px solid', borderColor: 'divider' }}
          />
          </>
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
