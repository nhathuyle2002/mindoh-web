import apiClient from './api';

// Helper to get token from localStorage (or other storage if used)
function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

import type { Expense, ExpenseRequest, ExpenseKind, ExpenseType } from '../types/api';

// Define a type for the filters used in getExpenses
export type ExpenseFilter = {
  user_id?: number;
  kind?: ExpenseKind;
  type?: ExpenseType;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
};

export const expenseService = {
  async createExpense(expenseData: ExpenseRequest): Promise<Expense> {
    const token = getAuthToken();
    const response = await apiClient.post<Expense>('/expenses/', expenseData, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    // The backend returns the created expense object directly
    return response.data;
  },

  async getExpenses(filters?: ExpenseFilter): Promise<Expense[]> {
    const token = getAuthToken();
    const response = await apiClient.get<Expense[]>('/expenses/', {
      params: filters,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    // The backend returns an array of expense objects directly
    return response.data;
  },
};
