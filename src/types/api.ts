// Type definitions for API responses
export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export type ExpenseKind = 'expense' | 'income';
export type ExpenseType = 'food' | 'salary' | 'transport' | 'entertainment' | 'other';

export interface Expense {
  id: number;
  user_id: number;
  amount: number;
  currency: string;
  kind: ExpenseKind;
  type: ExpenseType;
  description: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseRequest {
  user_id: number;
  amount: number;
  currency: string;
  kind: ExpenseKind;
  type: ExpenseType;
  description: string;
  date: string;
}

export interface ExpenseFilter {
  user_id?: number;
  kind?: string;
  type?: string;
  from?: string;
  to?: string;
}

export interface ExpenseSummary {
  expenses: Expense[];
  total_by_kind: Record<ExpenseKind, number>;
  total_by_type: Record<ExpenseType, number>;
  total_amount: number;
}

export interface ApiError {
  message: string;
  error?: string;
}
