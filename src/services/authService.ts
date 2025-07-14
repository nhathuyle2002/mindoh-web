
import apiClient from './api';
import type { LoginRequest, RegisterRequest, LoginResponse, User } from '../types/api';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/login', credentials);
    return response.data;
  },

  // Register returns only { user: User }
  async register(userData: RegisterRequest): Promise<{ user: User }> {
    const response = await apiClient.post<{ user: User }>('/register', userData);
    return response.data;
  },

  async getUser(userId: number): Promise<User> {
    const response = await apiClient.get<User>(`/users/${userId}`);
    return response.data;
  },

  async updateUser(userId: number, userData: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>(`/users/${userId}`, userData);
    return response.data;
  },

  async deleteUser(userId: number): Promise<void> {
    await apiClient.delete(`/users/${userId}`);
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getStoredUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getStoredToken(): string | null {
    return localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }
};
