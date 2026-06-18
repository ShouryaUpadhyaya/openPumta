import { create } from 'zustand';
import api from '@/lib/api';
import { queryClient } from '@/lib/queryClient';

interface User {
  id: number;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  isGuest: boolean;
  startOfDay?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
  guestLogin: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserPreferences: (prefs: { startOfDay: string }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  fetchUser: async () => {
    try {
      const { data } = await api.get('/auth/user');
      set({ user: data, loading: false });
      console.log('log in');
    } catch {
      console.error('login to save Progress');
      await get().guestLogin();
    }
  },
  guestLogin: async () => {
    try {
      const { data } = await api.post('/auth/guest-login');
      set({ user: data, loading: false });
    } catch (error) {
      console.error('Guest login failed', error);
      set({ user: null, loading: false });
    }
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');

      localStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');
      queryClient.clear();

      set({ user: null });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed', error);
    }
  },
  updateUserPreferences: async (prefs) => {
    try {
      const user = get().user;
      if (!user) return;
      const { data } = await api.patch(`/user/${user.id}`, prefs);
      set({ user: { ...user, ...data.data } });
    } catch (error) {
      console.error('Failed to update user preferences', error);
      throw error;
    }
  },
}));
