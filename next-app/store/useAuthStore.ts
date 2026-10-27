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
  activeAvatar?: string;
}

interface AuthState {
  user: User | null;
  lifetimeFocusMs: number;
  loading: boolean;
  fetchUser: (opts?: { guestFallback?: boolean }) => Promise<void>;
  fetchLifetimeFocus: () => Promise<void>;
  guestLogin: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserPreferences: (prefs: { startOfDay?: string; activeAvatar?: string }) => Promise<void>;
}

const PERSISTED_CACHE_KEY = 'REACT_QUERY_OFFLINE_CACHE';
const CACHE_OWNER_KEY = 'REACT_QUERY_CACHE_OWNER';

// Query keys aren't user-scoped, so a cache filled by one account (e.g. the guest created on
// /login) would be served to the next one as fresh data. Drop it whenever the user changes.
const claimQueryCache = (userId: number | null) => {
  try {
    const owner = userId === null ? '' : String(userId);
    if (localStorage.getItem(CACHE_OWNER_KEY) === owner) return;
    queryClient.clear();
    localStorage.removeItem(PERSISTED_CACHE_KEY);
    localStorage.setItem(CACHE_OWNER_KEY, owner);
  } catch {
    queryClient.clear();
  }
};

// Navigation and the auth forms all call fetchUser on mount; share one request so a
// logged-out visit doesn't create several guest users at once.
let inflightFetch: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  lifetimeFocusMs: 0,
  loading: true,
  fetchUser: ({ guestFallback = true } = {}) => {
    if (inflightFetch) return inflightFetch;
    inflightFetch = (async () => {
      try {
        const { data } = await api.get('/auth/user');
        claimQueryCache(data.id);
        set({ user: data, loading: false });
        await get().fetchLifetimeFocus();
      } catch {
        if (guestFallback) {
          await get().guestLogin();
        } else {
          claimQueryCache(null);
          set({ user: null, loading: false });
        }
      }
    })().finally(() => {
      inflightFetch = null;
    });
    return inflightFetch;
  },
  fetchLifetimeFocus: async () => {
    try {
      const { data } = await api.get('/users/lifetime-focus');
      set({ lifetimeFocusMs: data.data.lifetimeFocusMs });
    } catch (e) {
      console.error('Failed to fetch lifetime focus', e);
    }
  },
  guestLogin: async () => {
    try {
      const { data } = await api.post('/auth/guest-login');
      claimQueryCache(data.id);
      set({ user: data, loading: false });
    } catch (error) {
      console.error('Guest login failed', error);
      set({ user: null, loading: false });
    }
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');

      claimQueryCache(null);
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
      const { data } = await api.patch(`/users/${user.id}`, prefs);
      set({ user: { ...user, ...data.data } });
    } catch (error) {
      console.error('Failed to update user preferences', error);
      throw error;
    }
  },
}));
