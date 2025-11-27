import apiClient from './api';

// Helper to get token from localStorage (or other storage if used)
function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

import type { Expense, ExpenseRequest, ExpenseKind } from '../types/api';

// Define a type for the filters used in getExpenses
export type ExpenseFilter = {
  user_id?: number;
  kind?: ExpenseKind;
  type?: string;
  currency?: string;
  from?: string;
  to?: string;
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

  async getUniqueTypes(): Promise<string[]> {
    const token = getAuthToken();
    const response = await apiClient.get<Expense[]>('/expenses/', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    // Extract unique types from all expenses
    const types = new Set<string>();
    response.data.forEach(expense => {
      if (expense.type) {
        types.add(expense.type);
      }
    });
    return Array.from(types).sort();
  },
};
