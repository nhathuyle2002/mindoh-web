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
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { expenseService } from '../services/expenseService';
import type { Expense, ExpenseSummary } from '../types/api';

const Dashboard: React.FC = () => {
  const { state } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [dailySummary, setDailySummary] = useState<ExpenseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [expensesData, summaryData] = await Promise.all([
          expenseService.getExpenses({ limit: 10 }),
          expenseService.getDailySummary()
        ]);
        
        setExpenses(expensesData);
        setDailySummary(summaryData);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryColor = (category: string) => {
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
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}
      <Box display="flex" flexWrap="wrap" gap={3} mb={3}>
        <Box flex={1} minWidth={300}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today's Summary
              </Typography>
              {dailySummary ? (
                <Box>
                  <Typography variant="h4" color="primary" gutterBottom>
                    {formatCurrency(dailySummary.total_amount)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dailySummary.expense_count} expense{dailySummary.expense_count !== 1 ? 's' : ''}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(dailySummary.date)}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No expenses recorded for today
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
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
                        {formatCurrency(expense.amount)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                      <Chip
                        label={expense.category}
                        color={getCategoryColor(expense.category) as any}
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
