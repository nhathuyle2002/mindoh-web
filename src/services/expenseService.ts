import apiClient from './api';

import type { Expense, ExpenseRequest, ExpenseKind } from '../types/api';

// Define a type for the filters used in getExpenses
export type ExpenseFilter = {
  user_id?: number;
  kind?: ExpenseKind;
  type?: string;
  currencies?: string[];  // Changed from currency to currencies (array)
  original_currency?: string;  // Currency to convert totals into when no currency filter
  from?: string;
  to?: string;
  group_by?: string;  // Group by dimension (DAY, MONTH, YEAR)
};

export type CurrencySummary = {
  total_income: number;
  total_expense: number;
  balance: number;
  total_by_type: Record<string, number>;
};

export type ExpenseGroup = {
  key: string;   // Raw key (YYYY-MM-DD / YYYY-MM / YYYY)
  label: string; // Human-friendly label
  income: number;
  expense: number;
  balance: number;
  total_by_type: Record<string, number>;
};

export type ExpenseSummary = {
  expenses: Expense[];
  currency: string;              // VND if converted, or specific currency if filtered
  total_income: number;
  total_expense: number;
  balance: number;
  total_by_type: Record<string, number>;
  by_currency?: Record<string, CurrencySummary>;  // Only present when no currency filter
  groups?: ExpenseGroup[];  // Optional grouped summary buckets
};

export const expenseService = {
  async createExpense(expenseData: ExpenseRequest): Promise<Expense> {
    const response = await apiClient.post<Expense>('/expenses/', expenseData);
    return response.data;
  },

  async updateExpense(id: number, expenseData: Partial<ExpenseRequest>): Promise<Expense> {
    const response = await apiClient.put<Expense>(`/expenses/${id}`, expenseData);
    return response.data;
  },

  async deleteExpense(id: number): Promise<void> {
    await apiClient.delete(`/expenses/${id}`);
  },

  async getExpenses(filters?: ExpenseFilter): Promise<Expense[]> {
    const response = await apiClient.get<Expense[]>('/expenses/', { params: filters });
    return response.data;
  },

  async getUniqueTypes(): Promise<string[]> {
    const response = await apiClient.get<string[]>('/expenses/types');
    return response.data;
  },

  async getSummary(filters?: ExpenseFilter): Promise<ExpenseSummary> {
    const response = await apiClient.get<ExpenseSummary>('/expenses/summary', { params: filters });
    return response.data;
  },

  async getExchangeRates(): Promise<{ base_currency: string; rates: Record<string, number> }> {
    const response = await apiClient.get<{ base_currency: string; rates: Record<string, number> }>('/currency/exchange-rates');
    return response.data;
  },

  async getAvailableCurrencies(): Promise<string[]> {
    const response = await apiClient.get<{ currencies: string[] }>('/currency/currencies');
    return response.data.currencies;
  },
};
