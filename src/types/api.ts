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

export interface Expense {
  id: number;
  user_id: number;
  amount: number;
  description: string;
  category: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseRequest {
  amount: number;
  description: string;
  category: string;
  date: string;
}

export interface ExpenseSummary {
  date: string;
  total_amount: number;
  expense_count: number;
  expenses: Expense[];
}

export interface ApiError {
  message: string;
  error?: string;
}
