import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
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
  AppBar,
  Toolbar,
  Divider,
  Avatar,
  Stack,
  Fade,
  Fab,
} from '@mui/material';
import { 
  FilterList, 
  Close, 
  Add, 
  TrendingUp, 
  TrendingDown, 
  AccountBalance,
  Logout,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { expenseService } from '../services/expenseService';
import type { ExpenseFilter } from '../services/expenseService';
import type { Expense, ExpenseKind } from '../types/api';
import AddExpense from './AddExpense';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { state } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  // Filter states
  const [filters, setFilters] = useState<ExpenseFilter>({
    kind: undefined,
    type: undefined,
    from: undefined,
    to: undefined,
  });

  // Add this function to fetch and update expenses
  const fetchExpenses = async (filterParams?: ExpenseFilter) => {
    setLoading(true);
    setError(null);
    let expensesData: Expense[] = [];
    let errorMsg: string | null = null;
    try {
      expensesData = await expenseService.getExpenses(filterParams);
    } catch (err: any) {
      errorMsg = err.response?.data?.message || 'Failed to fetch expenses';
    }
    setExpenses(expensesData);
    setError(errorMsg);
    setLoading(false);
  };

  useEffect(() => {
    fetchExpenses(filters);
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
    if (filters.from) cleanFilters.from = filters.from;
    if (filters.to) cleanFilters.to = filters.to;
    
    fetchExpenses(cleanFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      kind: undefined,
      type: undefined,
      from: undefined,
      to: undefined,
    });
    fetchExpenses({});
  };

  const hasActiveFilters = filters.kind || filters.type || filters.from || filters.to;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
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

  const calculateTotals = () => {
    const income = expenses
      .filter(e => e.kind === 'income')
      .reduce((sum, e) => sum + e.amount, 0);
    const expense = expenses
      .filter(e => e.kind === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);
    return { income, expense, balance: income - expense };
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
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', color: 'text.primary', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <AccountBalance sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Mindoh Finance
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
              {state.user?.username?.[0]?.toUpperCase()}
            </Avatar>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {state.user?.username}
            </Typography>
            <Button 
              startIcon={<Logout />} 
              onClick={handleLogout}
              sx={{ ml: 2 }}
            >
              Logout
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        {/* Stats Cards */}
        <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
          <Card sx={{ flex: '1 1 250px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Income
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    ${totals.income.toFixed(2)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}>
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 250px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Expenses
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    ${totals.expense.toFixed(2)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}>
                  <TrendingDown />
                </Avatar>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 250px', background: totals.balance >= 0 
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
                  <Typography variant="h4" fontWeight="bold">
                    ${Math.abs(totals.balance).toFixed(2)}
                  </Typography>
                  <Typography variant="caption">
                    {totals.balance >= 0 ? 'Surplus' : 'Deficit'}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}>
                  <AccountBalance />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Filter Section */}
        <Box display="flex" gap={2} mb={2}>
          <Button 
            variant={showFilters ? "contained" : "outlined"}
            startIcon={<FilterList />} 
            onClick={() => setShowFilters(!showFilters)}
            color={hasActiveFilters ? "primary" : "inherit"}
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
            <Box flex="1 1 200px" minWidth="200px">
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
            <Box flex="1 1 200px" minWidth="200px">
              <TextField
                fullWidth
                label="Type"
                value={filters.type || ''}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                placeholder="e.g., food, salary"
                size="small"
              />
            </Box>
            <Box flex="1 1 200px" minWidth="200px">
              <TextField
                fullWidth
                type="date"
                label="From Date"
                value={filters.from || ''}
                onChange={(e) => handleFilterChange('from', e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Box>
            <Box flex="1 1 200px" minWidth="200px">
              <TextField
                fullWidth
                type="date"
                label="To Date"
                value={filters.to || ''}
                onChange={(e) => handleFilterChange('to', e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
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
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={handleOpen}
      >
        <Add />
      </Fab>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogContent>
          <AddExpense onExpenseAdded={() => { handleClose(); fetchExpenses(filters); }} />
        </DialogContent>
      </Dialog>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} variant="filled">{error}</Alert>
      )}

      <Paper sx={{ p: 3, borderRadius: 2 }} elevation={2}>
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
                    borderRadius: 1,
                    mb: 0.5
                  }}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body1" fontWeight={500}>
                          {expense.description || 'No description'}
                        </Typography>
                        <Typography 
                          variant="h6" 
                          fontWeight={600}
                          color={expense.kind === 'income' ? 'success.main' : 'error.main'}
                        >
                          {expense.kind === 'income' ? '+' : '-'}
                          {formatCurrency(expense.amount, expense.currency)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1}>
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
