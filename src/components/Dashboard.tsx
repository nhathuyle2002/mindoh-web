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
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { expenseService } from '../services/expenseService';
import type { Expense } from '../types/api';
import AddExpense from './AddExpense';

const Dashboard: React.FC = () => {
  const { state } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Add this function to fetch and update expenses
  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    let expensesData: Expense[] = [];
    let errorMsg: string | null = null;
    try {
      expensesData = await expenseService.getExpenses();
    } catch (err: any) {
      errorMsg = err.response?.data?.message || 'Failed to fetch expenses';
    }
    setExpenses(expensesData);
    setError(errorMsg);
    setLoading(false);
  };

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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
    const colors: { [key: string]: string } = {
      food: 'primary',
      transport: 'secondary',
      entertainment: 'success',
      utilities: 'warning',
      healthcare: 'error',
      shopping: 'info',
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome back, {state.user?.username}!
      </Typography>
      <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={handleOpen}>
        Add Expense
      </Button>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogContent>
          <AddExpense onExpenseAdded={() => { handleClose(); fetchExpenses(); }} />
        </DialogContent>
      </Dialog>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}
      <Box display="flex" flexWrap="wrap" gap={3} mb={3}>
        <Box flex={1} minWidth={300}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Stats
              </Typography>
              <Box>
                <Typography variant="body1">
                  Recent Expenses: {expenses.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last 10 transactions
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Recent Expenses
        </Typography>
        {expenses.length > 0 ? (
          <List>
            {expenses.map((expense) => (
              <ListItem key={expense.id} divider>
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body1">
                        {expense.description}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {formatCurrency(expense.amount, expense.currency)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                      <Chip
                        label={expense.type}
                        color={getCategoryColor(expense.type) as any}
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(expense.date)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No expenses found. Start by adding your first expense!
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default Dashboard;
