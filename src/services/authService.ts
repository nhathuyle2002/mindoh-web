
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

  async getMe(): Promise<User> {
    const token = localStorage.getItem('token');
    const response = await apiClient.get<User>('/users/me', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },

  async updateMe(userData: Partial<User>): Promise<User> {
    const token = localStorage.getItem('token');
    const response = await apiClient.put<User>('/users/me', userData, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },

  async updateMyEmail(email: string): Promise<User> {
    const token = localStorage.getItem('token');
    const response = await apiClient.put<User>('/users/me/email', { email }, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },

  async deleteUser(userId: number): Promise<void> {
    const token = localStorage.getItem('token');
    await apiClient.delete(`/users/${userId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/forgot-password', { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post('/reset-password', { token, password });
  },

  async verifyEmail(token: string): Promise<void> {
    await apiClient.get(`/verify-email?token=${token}`);
  },

  async resendVerification(email: string): Promise<void> {
    await apiClient.post('/resend-verification', { email });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const token = localStorage.getItem('token');
    await apiClient.post('/users/change-password', { current_password: currentPassword, new_password: newPassword }, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
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
