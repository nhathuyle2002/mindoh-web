import apiClient from './api';

import type { Expense, ExpenseRequest, ExpenseKind } from '../types/api';

// Define a type for the filters used in getExpenses (list)
export type ExpenseFilter = {
  user_id?: number;
  kind?: ExpenseKind;
  types?: string[];
  currencies?: string[];
  from?: string;
  to?: string;
  order_by?: 'date' | 'amount' | 'type' | 'kind' | 'currency' | 'created_at';
  order_dir?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
};

export type ExpenseListResponse = {
  page: number;
  page_size: number;
  count: number;
  data: Expense[];
};

// Filter for the summary endpoint
export type SummaryFilter = {
  kind?: ExpenseKind;
  types?: string[];
  currencies?: string[];
  original_currency?: string;
  from?: string;
  to?: string;
};

// Filter for the groups (time-bucket) endpoint
export type GroupsFilter = {
  kind?: ExpenseKind;
  types?: string[];
  currencies?: string[];
  original_currency?: string;
  from?: string;
  to?: string;
  group_by: string;  // DAY, WEEK, MONTH, YEAR
  order_by?: 'period' | 'income' | 'expense' | 'balance';
  order_dir?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
};

export type ExpenseGroupsResponse = {
  total: number;
  page: number;
  page_size: number;
  groups: ExpenseGroup[];
};

export type ExpenseGroup = {
  key: string;   // Raw key (YYYY-MM-DD / YYYY-MM / YYYY)
  label: string; // Human-friendly label
  income: number;
  expense: number;
  balance: number;
  total_by_type: Record<string, number>;
};

export type CurrencySummary = {
  total_income: number;
  total_expense: number;
  total_balance: number;
};

export type ExpenseSummary = {
  currency: string;
  income_count: number;
  expense_count: number;
  total_income: number;
  total_expense: number;
  total_balance: number;
  total_by_type_income: Record<string, number>;
  total_by_type_expense: Record<string, number>;
  by_currency?: Record<string, CurrencySummary>;
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

  async getExpenses(filters?: ExpenseFilter): Promise<ExpenseListResponse> {
    const response = await apiClient.get<ExpenseListResponse>('/expenses/', { params: filters });
    return response.data;
  },

  async getUniqueTypes(): Promise<string[]> {
    const response = await apiClient.get<string[]>('/expenses/types');
    return response.data;
  },

  async getSummary(filters?: SummaryFilter): Promise<ExpenseSummary> {
    const response = await apiClient.get<ExpenseSummary>('/expenses/summary', { params: filters });
    return response.data;
  },

  async getGroups(filters: GroupsFilter): Promise<ExpenseGroupsResponse> {
    const response = await apiClient.get<ExpenseGroupsResponse>('/expenses/groups', { params: filters });
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
