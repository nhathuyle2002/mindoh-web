import apiClient from './api';

import type { Expense, ExpenseRequest, ExpenseKind } from '../types/api';

// Define a type for the filters used in getExpenses (list)
export type ExpenseFilter = {
  user_id?: number;
  kind?: ExpenseKind;
  type?: string;
  currencies?: string[];  // Filter by multiple currencies
  from?: string;
  to?: string;
  order_by?: 'date' | 'amount' | 'type' | 'kind' | 'currency' | 'created_at'; // default: date
  order_dir?: 'asc' | 'desc'; // default: desc
};

export type ExpenseListResponse = {
  count: number;
  data: Expense[];
};

// Filter for the summary endpoint only
export type SummaryFilter = {
  original_currency?: string; // Currency to express totals in (default: VND)
  from?: string;
  to?: string;
  group_by?: string;          // DAY, MONTH, YEAR
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
  currency: string;              // Currency totals are expressed in
  total_income: number;
  total_expense: number;
  total_balance: number;
  total_by_type_income: Record<string, number>;   // Income totals per type (converted)
  total_by_type_expense: Record<string, number>;  // Expense totals per type (absolute, converted)
  by_currency?: Record<string, CurrencySummary>;  // Per-currency breakdown (only when multi-currency)
  groups?: ExpenseGroup[];       // Only present when group_by is set
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

  async getExchangeRates(): Promise<{ base_currency: string; rates: Record<string, number> }> {
    const response = await apiClient.get<{ base_currency: string; rates: Record<string, number> }>('/currency/exchange-rates');
    return response.data;
  },

  async getAvailableCurrencies(): Promise<string[]> {
    const response = await apiClient.get<{ currencies: string[] }>('/currency/currencies');
    return response.data.currencies;
  },
};
