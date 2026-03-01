import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      fetchUser: async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/auth/user`,
            {
              credentials: 'include',
            },
          );
          if (res.ok) {
            const data = await res.json();
            set({ user: data, loading: false });
          } else {
            set({ user: null, loading: false });
          }
        } catch {
          set({ user: null, loading: false });
        }
      },
      logout: async () => {
        try {
          await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/auth/logout`,
            {
              method: 'POST',
              credentials: 'include',
            },
          );
          set({ user: null });
          window.location.reload();
        } catch (error) {
          console.error('Logout failed', error);
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
