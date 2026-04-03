import { create } from 'zustand';
import api from '@/lib/api';

interface User {
  id: number;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  fetchUser: async () => {
    try {
      const { data } = await api.get('/api/auth/user');
      set({ user: data, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
  logout: async () => {
    try {
      await api.post('/api/auth/logout');
      set({ user: null });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed', error);
    }
  },
}));
