import { create } from 'zustand';
import { authAPI } from '../services/api';

interface User {
  id: number;
  email: string;
  firmName?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  register: (email: string, password: string, firmName?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,

  register: async (email, password, firmName) => {
    set({ loading: true, error: null });
    try {
      await authAPI.register(email, password, firmName);
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Registration failed', loading: false });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.login(email, password);
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      set({ user, token, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Login failed', loading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await authAPI.getMe();
      set({ user: response.data, token });
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, token: null });
    }
  },
}));
