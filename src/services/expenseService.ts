import apiClient from './api';
import type { Expense, ExpenseRequest, ExpenseSummary } from '../types/api';

export const expenseService = {
  async createExpense(expenseData: ExpenseRequest): Promise<Expense> {
    const response = await apiClient.post<Expense>('/expenses', expenseData);
    return response.data;
  },

  async getExpenses(filters?: {
    category?: string;
    date_from?: string;
    date_to?: string;
    limit?: number;
    offset?: number;
  }): Promise<Expense[]> {
    const response = await apiClient.get<Expense[]>('/expenses', {
      params: filters,
    });
    return response.data;
  },

  async getDailySummary(date?: string): Promise<ExpenseSummary> {
    const response = await apiClient.get<ExpenseSummary>('/expenses/summary/day', {
      params: date ? { date } : undefined,
    });
    return response.data;
  },
};
