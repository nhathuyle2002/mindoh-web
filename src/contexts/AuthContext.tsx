import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types/api';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_REGISTER_SUCCESS' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'AUTH_INIT_DONE' }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  token: null,
  loading: true,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'AUTH_REGISTER_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return { ...state, user: action.payload, loading: false, error: null };
    case 'AUTH_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
        user: null,
        token: null,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'AUTH_INIT_DONE':
      return { ...state, loading: false };
    default:
      return state;
  }
};

interface AuthContextType {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, name?: string) => Promise<boolean>;
  updateUser: (fields: Partial<User>) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const storedToken = authService.getStoredToken();
    const storedUser = authService.getStoredUser();
    if (storedToken && storedUser) {
      dispatch({ type: 'AUTH_SUCCESS', payload: { token: storedToken, user: storedUser } });
    } else {
      dispatch({ type: 'AUTH_INIT_DONE' });
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authService.login({ username, password });
      // Store in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { token: response.token, user: response.user }
      });
    } catch (error: any) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.response?.data?.message || 'Login failed'
      });
    }
  };

  // Register does not log in, just stores user and redirects to login
  const register = async (username: string, email: string, password: string, name?: string): Promise<boolean> => {
    try {
      dispatch({ type: 'AUTH_START' });
      await authService.register({ username, email, password, name });
      dispatch({ type: 'AUTH_REGISTER_SUCCESS' });
      return true;
    } catch (error: any) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.response?.data?.message || 'Registration failed'
      });
      return false;
    }
  };

  const updateUser = async (fields: Partial<User>): Promise<boolean> => {
    if (!state.user) return false;
    try {
      dispatch({ type: 'AUTH_START' });
      const updated = await authService.updateUser(state.user.id, fields);
      localStorage.setItem('user', JSON.stringify(updated));
      dispatch({ type: 'UPDATE_USER', payload: updated });
      return true;
    } catch (error: any) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.response?.data?.error || 'Update failed',
      });
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    state,
    dispatch,
    login,
    register,
    updateUser,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
