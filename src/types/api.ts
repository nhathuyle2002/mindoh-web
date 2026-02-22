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

export type ExpenseResource = 'CASH' | 'CAKE' | 'VCB' | 'VPBANK' | 'BIDV' | 'OTHER';

export interface Expense {
  id: number;
  user_id: number;
  amount: number;
  currency: string;
  kind: ExpenseKind;
  type: string;
  resource?: ExpenseResource;
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
  type: string;
  resource?: ExpenseResource;
  description?: string;
  date: string;
}

export interface ApiError {
  message: string;
  error?: string;
}
