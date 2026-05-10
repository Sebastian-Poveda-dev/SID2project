import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserSummary } from '../types/user';

interface AuthState {
  token: string | null;
  user: UserSummary | null;
  isAuthenticated: boolean;
  login: (token: string, user: UserSummary) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: (token, user) =>
        set({ token, user, isAuthenticated: true }),

      logout: () =>
        set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'uniplan-auth',
    }
  )
);
